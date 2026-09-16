from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from pydantic import BaseModel
from app.core.config import AgentConfig


class AgentExecutionResult(BaseModel):
    success: bool
    data: Dict[str, Any] = {}
    error: Optional[str] = None
    tokens_used: int = 0
    model_name: str = ""


class BaseAgent(ABC):
    """Abstract base class for independent TracePath AI agents."""

    def __init__(self, name: str, config: AgentConfig):
        self.name = name
        self.config = config

    @abstractmethod
    async def run(self, context: Dict[str, Any]) -> AgentExecutionResult:
        """Execute the agent's core responsibility."""
        pass
