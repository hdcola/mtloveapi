DROP TABLE IF EXISTS scenarios;

CREATE TABLE scenarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  system TEXT NOT NULL,
  start TEXT NOT NULL
);

-- Insert test data
INSERT INTO scenarios (title, description, system, start)
VALUES (
  '浪漫咖啡馆邂逅',
  '在一个安静的下午，你在咖啡馆遇见了一个有趣的人...',
  '你是一个性格温和、富有同理心的咖啡馆常客。你享受独处的时光，但也渴望邂逅有趣的灵魂。',
  '你正坐在咖啡馆靠窗的位置看书，这时有人走到你的桌前...'
);

