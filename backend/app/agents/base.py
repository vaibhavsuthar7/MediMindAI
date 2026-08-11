from abc import ABC, abstractmethod


class BaseAgent(ABC):
    """Common contract every specialized agent follows, so the
    Orchestrator can call any of them the same way."""

    name: str = "base_agent"
    description: str = "Base agent"

    @abstractmethod
    def run(self, *args, **kwargs) -> dict:
        ...
