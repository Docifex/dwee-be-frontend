const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const { userContainer, dweebeContainer } = require('./cosmosClient');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 31415;

/**
 * GET /api/users/:oid
 * Fetch a user by their external ID.
 */
app.get('/api/users/:oid', async (req, res) => {
  try {
    const { oid } = req.params;
    const { resource } = await userContainer.item(oid, oid).read();
    if (!resource) return res.status(404).json({ message: 'User not found' });
    res.json(resource);
  } catch (err) {
    console.error('Cosmos DB read error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/users
 * Create or update a user record.
 * Body: { externalId: string, email: string, userName, phones, emails, address, billing, subscription, person, roles }
 * Returns the user record JSON.
 */
app.post('/api/users', async (req, res) => {
  const {
    externalId,
    email,
    userName,
    phones,
    emails,
    address,
    billing,
    subscription,
    person,
    roles
  } = req.body;

  if (!externalId) {
    res.status(400).json({ message: 'externalId is required' });
    return;
  }

  try {
    console.log('[API] Incoming payload body:', req.body);

    let existingUser = {};
    try {
      const readResult = await userContainer.item(externalId, externalId).read();
      existingUser = readResult.resource || {};
      console.log('[API] Existing user from DB:', existingUser);
    } catch (readErr) {
      console.warn('[API] No existing user found or read error:', readErr);
    }

    const userItem = {
      ...existingUser,
      id: externalId,
      externalId,
      email: email || existingUser.email || null,
      userName: userName || existingUser.userName || null,
      phones: Array.isArray(phones) ? phones : existingUser.phones || [],
      emails: Array.isArray(emails) ? emails : existingUser.emails || [],
      address: typeof address === 'object' ? address : existingUser.address || {},
      billing: typeof billing === 'object' ? billing : existingUser.billing || {},
      subscription: typeof subscription === 'object' ? subscription : existingUser.subscription || {},
      person: typeof person === 'object' ? person : existingUser.person || {},
      roles: Array.isArray(roles) ? roles : existingUser.roles || [],
      createdAt: existingUser.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('[API] Upserting user with roles:', userItem.roles);
    console.log('[API] Upserting user with final payload:', JSON.stringify(userItem, null, 2));

    const { resource } = await userContainer.items.upsert(userItem);
    console.log('[API] Upsert complete. DB returned:', resource);
    res.json(resource);

  } catch (err) {
    console.error('Cosmos DB upsert error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PATCH /api/users/:oid/roles
 * Update roles for a user by their external ID.
 */
app.patch('/api/users/:oid/roles', async (req, res) => {
  const { oid } = req.params;
  const { roles } = req.body;

  if (!Array.isArray(roles)) {
    return res.status(400).json({ message: 'roles must be an array' });
  }

  try {
    const { resource } = await userContainer.item(oid, oid).read();
    if (!resource) {
      return res.status(404).json({ message: 'User not found' });
    }

    resource.roles = roles;
    resource.updatedAt = new Date().toISOString();

    const { resource: updated } = await userContainer.items.upsert(resource);
    res.json(updated);
  } catch (err) {
    console.error('Cosmos DB patch error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DWEEBE Spawn Event Route
 */
function createDweebeSpawn(message, userId, userName) {
  return {
    id: `dweebe_${Date.now()}`,
    type: 'DWEEBESpawnEvent',
    message,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      origin: 'chatbox',
      userId: userId || 'anonymous',
      userName: userName || 'unknown',
      resonanceGlyph: '🗣️✨'
    }
  };
}

app.post('/api/dweebe-spawn', async (req, res) => {
  try {
    const { message, userId, userName } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const dweebeEntry = createDweebeSpawn(message, userId, userName);
    console.log('[DWEEBE-SPAWN] Inserting DWEEBE:', dweebeEntry);

    const result = await dweebeContainer.items.create(dweebeEntry);
    console.log('[DWEEBE-SPAWN] Insert result:', result.statusCode);

    res.json({
      success: true,
      responseText: `DWEEBE received your message: "${message}"`,
      dweebe: dweebeEntry
    });
  } catch (err) {
    console.error('Error handling /api/dweebe-spawn:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`DWEEBE API listening on http://localhost:${PORT}`);
});

module.exports = app;
