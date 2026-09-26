from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class LogEntry:
    index: int
    term: int
    command: str
    args: dict


class Log:
    def __init__(self) -> None:
        self._entries: list[LogEntry] = []

    def append(self, term: int, command: str, args: dict) -> LogEntry:
        index = len(self._entries) + 1
        entry = LogEntry(index=index, term=term, command=command, args=args)
        self._entries.append(entry)
        return entry

    def entries_from(self, index: int) -> list[LogEntry]:
        if index <= 0:
            return self._entries[:]
        return self._entries[index - 1 :]


log = Log()