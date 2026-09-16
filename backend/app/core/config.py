from enum import Enum
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class EnvironmentType(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"


class AgentConfig(BaseSettings):
    """Configuration for an independent AI Agent."""
    name: str = "Agent"
    model: str = "gpt-4o"
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    temperature: float = 0.2
    max_tokens: int = 4096
    timeout_seconds: float = 60.0
    mock_mode: bool = False


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Core App Settings
    PROJECT_NAME: str = "TracePath AI Backend"
    VERSION: str = "0.2.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: EnvironmentType = EnvironmentType.DEVELOPMENT
    DEBUG: bool = True

    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Security
    SECRET_KEY: str = "tracepath-development-secret-key-change-in-production-min-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./tracepath_dev.db"
    SYNC_DATABASE_URL: str = "sqlite:///./tracepath_dev.db"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False

    # GitHub App Integration Settings
    GITHUB_APP_ID: Optional[str] = None
    GITHUB_APP_CLIENT_ID: Optional[str] = None
    GITHUB_APP_CLIENT_SECRET: Optional[str] = None
    GITHUB_APP_PRIVATE_KEY: Optional[str] = None
    GITHUB_WEBHOOK_SECRET: Optional[str] = None

    # =========================================================================
    # THREE INDEPENDENT AI AGENT CONFIGURATIONS
    # =========================================================================
    
    # AGENT 1: Analysis Agent
    AGENT_1_MODEL: str = "gpt-4o-mini"
    AGENT_1_API_KEY: Optional[str] = None
    AGENT_1_BASE_URL: Optional[str] = None
    AGENT_1_TEMPERATURE: float = 0.1
    AGENT_1_TIMEOUT: float = 60.0

    # AGENT 2: Differential / Decision Agent
    AGENT_2_MODEL: str = "gpt-4o"
    AGENT_2_API_KEY: Optional[str] = None
    AGENT_2_BASE_URL: Optional[str] = None
    AGENT_2_TEMPERATURE: float = 0.1
    AGENT_2_TIMEOUT: float = 60.0

    # AGENT 3: Documentation Generator
    AGENT_3_MODEL: str = "gpt-4o"
    AGENT_3_API_KEY: Optional[str] = None
    AGENT_3_BASE_URL: Optional[str] = None
    AGENT_3_TEMPERATURE: float = 0.2
    AGENT_3_TIMEOUT: float = 90.0

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == EnvironmentType.PRODUCTION

    @property
    def agent_1_config(self) -> AgentConfig:
        return AgentConfig(
            name="AnalysisAgent",
            model=self.AGENT_1_MODEL,
            api_key=self.AGENT_1_API_KEY,
            base_url=self.AGENT_1_BASE_URL,
            temperature=self.AGENT_1_TEMPERATURE,
            timeout_seconds=self.AGENT_1_TIMEOUT,
            mock_mode=not bool(self.AGENT_1_API_KEY),
        )

    @property
    def agent_2_config(self) -> AgentConfig:
        return AgentConfig(
            name="DecisionAgent",
            model=self.AGENT_2_MODEL,
            api_key=self.AGENT_2_API_KEY,
            base_url=self.AGENT_2_BASE_URL,
            temperature=self.AGENT_2_TEMPERATURE,
            timeout_seconds=self.AGENT_2_TIMEOUT,
            mock_mode=not bool(self.AGENT_2_API_KEY),
        )

    @property
    def agent_3_config(self) -> AgentConfig:
        return AgentConfig(
            name="DocGeneratorAgent",
            model=self.AGENT_3_MODEL,
            api_key=self.AGENT_3_API_KEY,
            base_url=self.AGENT_3_BASE_URL,
            temperature=self.AGENT_3_TEMPERATURE,
            timeout_seconds=self.AGENT_3_TIMEOUT,
            mock_mode=not bool(self.AGENT_3_API_KEY),
        )


settings = Settings()
