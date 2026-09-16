from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.logging import logger


class TracePathException(Exception):
    """Base exception for TracePath AI domain errors."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class EntityNotFoundException(TracePathException):
    """Exception raised when a requested entity does not exist."""
    def __init__(self, entity_name: str, entity_id: Any):
        super().__init__(
            message=f"{entity_name} with id '{entity_id}' was not found.",
            details={"entity_name": entity_name, "entity_id": str(entity_id)},
        )


class EntityAlreadyExistsException(TracePathException):
    """Exception raised when attempting to create a duplicate entity."""
    def __init__(self, entity_name: str, field: str, value: Any):
        super().__init__(
            message=f"{entity_name} with {field} '{value}' already exists.",
            details={"entity_name": entity_name, "field": field, "value": str(value)},
        )


class InvalidStateTransitionException(TracePathException):
    """Exception raised when an invalid workflow or automation state transition is attempted."""
    def __init__(self, current_state: str, target_state: str, reason: Optional[str] = None):
        msg = f"Cannot transition state from '{current_state}' to '{target_state}'."
        if reason:
            msg += f" Reason: {reason}"
        super().__init__(
            message=msg,
            details={"current_state": current_state, "target_state": target_state, "reason": reason},
        )


class GitHubIntegrationException(TracePathException):
    """Exception raised when a GitHub API operation fails."""
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(
            message=f"GitHub Integration Error: {message}",
            details={"status_code": status_code},
        )


class AgentExecutionException(TracePathException):
    """Exception raised when an AI agent fails during pipeline execution."""
    def __init__(self, agent_name: str, message: str):
        super().__init__(
            message=f"Agent '{agent_name}' error: {message}",
            details={"agent_name": agent_name},
        )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(EntityNotFoundException)
    async def entity_not_found_handler(request: Request, exc: EntityNotFoundException) -> JSONResponse:
        logger.warning(f"Entity not found: {exc.message} (Path: {request.url.path})")
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": "NOT_FOUND",
                "message": exc.message,
                "details": exc.details,
            },
        )

    @app.exception_handler(EntityAlreadyExistsException)
    async def entity_already_exists_handler(request: Request, exc: EntityAlreadyExistsException) -> JSONResponse:
        logger.warning(f"Entity conflict: {exc.message} (Path: {request.url.path})")
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "error": "CONFLICT",
                "message": exc.message,
                "details": exc.details,
            },
        )

    @app.exception_handler(InvalidStateTransitionException)
    async def invalid_state_transition_handler(request: Request, exc: InvalidStateTransitionException) -> JSONResponse:
        logger.warning(f"Invalid state transition: {exc.message} (Path: {request.url.path})")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "INVALID_STATE_TRANSITION",
                "message": exc.message,
                "details": exc.details,
            },
        )

    @app.exception_handler(TracePathException)
    async def general_tracepath_handler(request: Request, exc: TracePathException) -> JSONResponse:
        logger.error(f"TracePath error: {exc.message}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "DOMAIN_ERROR",
                "message": exc.message,
                "details": exc.details,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "VALIDATION_ERROR",
                "message": "Invalid request payload or parameters.",
                "details": exc.errors(),
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(f"Unhandled server exception on {request.url.path}: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred.",
                "details": {},
            },
        )
