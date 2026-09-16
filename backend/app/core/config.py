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
    model: str = "gpt-4o"
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    temperature: float = 0.2
    max_tokens: int = 4096


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Core App Settings
    PROJECT_NAME: str = "TracePath AI Backend"
    VERSION: str = "0.1.0"
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

    # GitHub App Integration Settings (Phase 2)
    GITHUB_APP_ID: Optional[str] = None
    GITHUB_APP_CLIENT_ID: Optional[str] = None
    GITHUB_APP_CLIENT_SECRET: Optional[str] = None
    GITHUB_APP_PRIVATE_KEY: Optional[str] = None
    GITHUB_WEBHOOK_SECRET: Optional[str] = None

    # AI Agents (Phase 2 - 3 Independent Agents)
    # Agent 1: Change Analyzer
    AGENT_CHANGE_ANALYZER_MODEL: str = "gpt-4o-mini"
    AGENT_CHANGE_ANALYZER_API_KEY: Optional[str] = None
    AGENT_CHANGE_ANALYZER_BASE_URL: Optional[str] = None

    # Agent 2: Impact Planner
    AGENT_IMPACT_PLANNER_MODEL: str = "gpt-4o"
    AGENT_IMPACT_PLANNER_API_KEY: Optional[str] = None
    AGENT_IMPACT_PLANNER_BASE_URL: Optional[str] = None

    # Agent 3: Doc Generator & Validator
    AGENT_DOC_GENERATOR_MODEL: str = "gpt-4o"
    AGENT_DOC_GENERATOR_API_KEY: Optional[str] = None
    AGENT_DOC_GENERATOR_BASE_URL: Optional[str] = None

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
    def change_analyzer_config(self) -> AgentConfig:
        return AgentConfig(
            model=self.AGENT_CHANGE_ANALYZER_MODEL,
            api_key=self.AGENT_CHANGE_ANALYZER_API_KEY,
            base_url=self.AGENT_CHANGE_ANALYZER_BASE_URL,
        )

    @property
    def impact_planner_config(self) -> AgentConfig:
        return AgentConfig(
            model=self.AGENT_IMPACT_PLANNER_MODEL,
            api_key=self.AGENT_IMPACT_PLANNER_API_KEY,
            base_url=self.AGENT_IMPACT_PLANNER_BASE_URL,
        )

    @property
    def doc_generator_config(self) -> AgentConfig:
        return AgentConfig(
            model=self.AGENT_DOC_GENERATOR_MODEL,
            api_key=self.AGENT_DOC_GENERATOR_API_KEY,
            base_url=self.AGENT_DOC_GENERATOR_BASE_URL,
        )


settings = Settings()
