from functools import wraps
from flask import request, jsonify
import jwt
from jwt import PyJWTError
import os

# Custom Exceptions
class AuthError(Exception):
    """Base authentication error"""
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code

class InvalidTokenError(AuthError):
    """Raised when token is invalid or expired"""
    pass

class InsufficientPermissionsError(AuthError):
    """Raised when user lacks required permissions"""
    pass

# Auth0 Configuration
AUTH0_DOMAIN = os.getenv('AUTH0_DOMAIN')
AUTH0_AUDIENCE = os.getenv('AUTH0_AUDIENCE')

def get_token_from_header():
    """Extract JWT token from Authorization header"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        raise AuthError({'message': 'Authorization header missing'}, 401)
    
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise AuthError({'message': 'Invalid authorization header format'}, 401)
    
    return parts[1]

def verify_auth0_token(token):
    """Verify and decode Auth0 JWT token"""
    try:
        # Get the public key from Auth0
        from auth0.authentication import GetToken
        from requests import get as requests_get
        
        jwks_url = f'https://{AUTH0_DOMAIN}/.well-known/jwks.json'
        jwks_response = requests_get(jwks_url)
        jwks = jwks_response.json()
        
        # Decode and verify token
        payload = jwt.decode(
            token,
            options={"verify_signature": False}  # Will verify with key below
        )
        
        # For production, properly validate against JWKS
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get('kid')
        
        # Find the key in JWKS
        key = next((key for key in jwks['keys'] if key['kid'] == kid), None)
        if not key:
            raise InvalidTokenError({'message': 'Unable to find signing key'}, 401)
        
        # Properly decode with verification
        payload = jwt.decode(
            token,
            key=jwt.algorithms.RSAAlgorithm.from_jwk(key),
            algorithms=['RS256'],
            audience=AUTH0_AUDIENCE,
            issuer=f'https://{AUTH0_DOMAIN}/'
        )
        
        return payload
    
    except PyJWTError as e:
        raise InvalidTokenError({'message': f'Invalid token: {str(e)}'}, 401)
    except Exception as e:
        raise InvalidTokenError({'message': f'Token verification failed: {str(e)}'}, 401)

def require_auth(f):
    """
    Decorator to require authentication via Auth0 token in Authorization header.
    Does not check specific permissions, only validates token.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            token = get_token_from_header()
            payload = verify_auth0_token(token)
            request.user = payload
            
        except AuthError as e:
            return jsonify(e.error), e.status_code
        
        return f(*args, **kwargs)
    
    return decorated_function
