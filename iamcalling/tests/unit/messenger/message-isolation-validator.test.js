import { expect } from 'chai';

let MessageIsolationValidator;

const originalFetch = global.fetch;

function setFetchResponse({ ok = true, status = 200, json = async () => [] } = {}) {
  global.fetch = async () => ({
    ok,
    status,
    json,
  });
}

before(async () => {
  global.window = {
    APP_CONFIG: {
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'test-anon-key',
    },
  };

  await import('../../../public/js/message-isolation-validator.js');
  MessageIsolationValidator = global.window.MessageIsolationValidator;
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('MessageIsolationValidator', () => {
  it('validates message access for current user as sender or receiver', () => {
    const validator = new MessageIsolationValidator(10);

    expect(validator.validateMessageAccess({ sender_id: 10, receiver_id: 20 })).to.equal(true);
    expect(validator.validateMessageAccess({ sender_id: 30, receiver_id: 10 })).to.equal(true);
    expect(validator.validateMessageAccess({ sender_id: 30, receiver_id: 40 })).to.equal(false);
  });

  it('builds isolated conversations with last message and unread count', async () => {
    const validator = new MessageIsolationValidator(10);

    const messages = [
      {
        id: 1,
        sender_id: 10,
        receiver_id: 20,
        content: 'first',
        created_at: '2026-02-11T08:00:00.000Z',
        read: true,
      },
      {
        id: 2,
        sender_id: 20,
        receiver_id: 10,
        content: 'second',
        created_at: '2026-02-11T08:05:00.000Z',
        read: false,
      },
      {
        id: 3,
        sender_id: 30,
        receiver_id: 10,
        content: 'hello',
        created_at: '2026-02-11T08:04:00.000Z',
        read: false,
      },
      {
        id: 4,
        sender_id: 40,
        receiver_id: 50,
        content: 'not visible',
        created_at: '2026-02-11T08:06:00.000Z',
        read: false,
      },
    ];

    setFetchResponse({
      json: async () => messages,
    });

    const conversations = await validator.getIsolatedConversations();

    expect(conversations).to.be.instanceOf(Map);
    expect(conversations.size).to.equal(2);

    const conv20 = conversations.get(20);
    expect(conv20.lastMessage).to.equal('second');
    expect(conv20.unreadCount).to.equal(1);

    const conv30 = conversations.get(30);
    expect(conv30.lastMessage).to.equal('hello');
    expect(conv30.unreadCount).to.equal(1);
  });

  it('returns empty map when conversation fetch fails', async () => {
    const validator = new MessageIsolationValidator(10);

    setFetchResponse({ ok: false, status: 500 });

    const conversations = await validator.getIsolatedConversations();

    expect(conversations).to.be.instanceOf(Map);
    expect(conversations.size).to.equal(0);
  });

  it('prevents sending messages to self', async () => {
    const validator = new MessageIsolationValidator(10);

    let fetchCalled = false;
    global.fetch = async () => {
      fetchCalled = true;
      return { ok: true, json: async () => [] };
    };

    const result = await validator.sendIsolatedMessage(10, 'hello');

    expect(result).to.equal(null);
    expect(fetchCalled).to.equal(false);
  });

  it('sends isolated message and returns saved payload', async () => {
    const validator = new MessageIsolationValidator(10);

    const savedMessage = {
      id: 99,
      sender_id: 10,
      receiver_id: 20,
      content: 'hello',
      created_at: '2026-02-11T08:10:00.000Z',
      read: false,
    };

    setFetchResponse({
      json: async () => [savedMessage],
    });

    const result = await validator.sendIsolatedMessage(20, 'hello');

    expect(result).to.deep.equal(savedMessage);
  });

  it('marks messages as read successfully', async () => {
    const validator = new MessageIsolationValidator(10);

    setFetchResponse();

    const result = await validator.markMessagesAsRead(20);

    expect(result).to.equal(true);
  });
});