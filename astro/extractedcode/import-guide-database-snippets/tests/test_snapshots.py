"""Test displayed snapshots; fixtures do not prove a complete provider migration."""
import hashlib
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class DisplayedPassages(unittest.TestCase):
    def test_pinned_snapshot_checksums(self):
        entries = re.findall(r"\| `([^`]+)` \| .* \| `([a-f0-9]{64})` \|", (ROOT / "SOURCES.md").read_text())
        self.assertEqual(len(entries), 3)
        for filename, expected in entries:
            with self.subTest(filename=filename):
                self.assertEqual(hashlib.sha256((ROOT / filename).read_bytes()).hexdigest(), expected)


if __name__ == "__main__":
    unittest.main(verbosity=2)
