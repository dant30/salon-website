from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user


class IsAdminOrStaff(permissions.BasePermission):
    """
    Custom permission to only allow admin or staff members.
    """
    
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_staff_member)


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class IsClient(permissions.BasePermission):
    """
    Custom permission to only allow client users (not staff).
    """
    
    def has_permission(self, request, view):
        return request.user and not request.user.is_staff_member and not request.user.is_staff