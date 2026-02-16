import { Knex } from 'knex';
import { saltHashPassword } from '../../auth/hash-password';

/**
 * Seeded random number generator for deterministic test data
 * Uses a simple Linear Congruential Generator (LCG)
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    // Multiply seed and add "random" number to the seed.
    // These specific numbers aren't random - they're carefully chosen constants that mathematicians found work well for generating "random-looking" sequences. They're the same constants used in the GNU C library.
    // bitwise AND keeps only the first 31 bits
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
}

/**
 * Seed test data for API compatibility testing
 *
 * Creates:
 * - 3 devices (2 enabled, 1 disabled)
 * - 2,200+ readings per device with realistic intervals
 * - 1 test user (testuser/testpassword)
 * - 1 API key (test-api-key-12345)
 *
 * IMPORTANT: Uses a FIXED reference date (February 12, 2026 10:00 AM)
 * - All timestamps are calculated relative to this date
 * - Tests will mock Date.now() to return this same date
 * - This ensures tests remain deterministic and never break due to calendar changes
 * - "Current day" = Feb 12, 2026 (readings from 00:00 to 10:00)
 * - "Yesterday" = Feb 11, 2026
 * - "Current month" = February 2026 (incomplete)
 * - "Current year" = 2026 (incomplete)
 */
export async function seed(knex: Knex): Promise<void> {
  console.log('🌱 Starting test data seed...\n');

  // Fixed reference date for deterministic testing
  // Tests will mock Date.now() to always return this date
  const FIXED_NOW = new Date('2026-02-12T10:00:00Z');
  console.log(`📅 Using fixed reference date: ${FIXED_NOW.toISOString()}\n`);

  // Clear existing test data
  // First, clear the foreign key reference from devices to readings
  await knex('device').update({ latest_reading: null });
  
  // Now we can safely delete in any order
  await knex('reading').del();
  await knex('auth').del();
  await knex('user').del();
  await knex('device').del();

  // ============================================
  // SEED DEVICES
  // ============================================
  const devices = [
    {
      id: 'device-001',
      name: 'Living Room Sensor',
      location_x: 100,
      location_y: 200,
      location_type: 'inside',
      type: 'ruuvi',
      disabled: false,
      order: 1,
    },
    {
      id: 'device-002',
      name: 'Balcony Sensor',
      location_x: 300,
      location_y: 50,
      location_type: 'outside',
      type: 'ruuvi',
      disabled: false,
      order: 2,
    },
    {
      id: 'device-003',
      name: 'Bedroom Sensor',
      location_x: 200,
      location_y: 300,
      location_type: 'inside',
      type: 'sensorbug',
      disabled: true,
      order: 3,
    },
  ];

  await knex('device').insert(devices);
  console.log('✓ Seeded 3 devices');

  // ============================================
  // SEED READINGS
  // ============================================
  const readings: any[] = [];
  let readingCount = 0;

  // Helper to create readings for a device
  const createReadings = (
    deviceId: string,
    baseTemp: number,
    baseHumidity: number,
    rng: SeededRandom
  ) => {
    const deviceReadings: any[] = [];

    // Yesterday (complete day with 10-minute intervals) - 144 readings
    const yesterday = new Date(FIXED_NOW);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 144; i++) {
      const timestamp = new Date(yesterday.getTime() + i * 10 * 60 * 1000);
      deviceReadings.push({
        device: deviceId,
        temperature: baseTemp + Math.sin(i / 24) * 3 + (rng.next() - 0.5),
        humidity: baseHumidity + Math.cos(i / 24) * 10 + (rng.next() - 0.5) * 2,
        pressure: 1013 + Math.sin(i / 48) * 5 + (rng.next() - 0.5),
        battery: 95 - i * 0.01,
        created_at: timestamp,
      });
    }

    // Day before yesterday (10-minute intervals) - 144 readings
    const dayBeforeYesterday = new Date(FIXED_NOW);
    dayBeforeYesterday.setUTCDate(dayBeforeYesterday.getUTCDate() - 2);
    dayBeforeYesterday.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 144; i++) {
      const timestamp = new Date(
        dayBeforeYesterday.getTime() + i * 10 * 60 * 1000
      );
      deviceReadings.push({
        device: deviceId,
        temperature: baseTemp + Math.sin(i / 24) * 3 + (rng.next() - 0.5),
        humidity: baseHumidity + Math.cos(i / 24) * 10 + (rng.next() - 0.5) * 2,
        pressure: 1013 + Math.sin(i / 48) * 5 + (rng.next() - 0.5),
        battery: 94 - i * 0.01,
        created_at: timestamp,
      });
    }

    // Current day (30-minute intervals from midnight to FIXED_NOW)
    const todayStart = new Date(FIXED_NOW);
    todayStart.setUTCHours(0, 0, 0, 0);
    const minutesSinceMidnight =
      (FIXED_NOW.getTime() - todayStart.getTime()) / (60 * 1000);
    const currentDayReadings = Math.floor(minutesSinceMidnight / 30);

    for (let i = 0; i < currentDayReadings; i++) {
      const timestamp = new Date(todayStart.getTime() + i * 30 * 60 * 1000);
      deviceReadings.push({
        device: deviceId,
        temperature: baseTemp + Math.sin(i / 48) * 3 + (rng.next() - 0.5),
        humidity: baseHumidity + Math.cos(i / 48) * 10 + (rng.next() - 0.5) * 2,
        pressure: 1013 + Math.sin(i / 96) * 5 + (rng.next() - 0.5),
        battery: 96 - i * 0.02,
        created_at: timestamp,
      });
    }

    // Previous 5 complete days (30-minute intervals) - 48 per day = 240 readings
    // Days -3, -4, -5, -6, -7 relative to FIXED_NOW
    for (let day = 3; day <= 7; day++) {
      const dayStart = new Date(FIXED_NOW);
      dayStart.setUTCDate(dayStart.getUTCDate() - day);
      dayStart.setUTCHours(0, 0, 0, 0);

      for (let i = 0; i < 48; i++) {
        const timestamp = new Date(dayStart.getTime() + i * 30 * 60 * 1000);
        deviceReadings.push({
          device: deviceId,
          temperature: baseTemp + Math.sin(i / 24) * 3 + (rng.next() - 0.5),
          humidity:
            baseHumidity + Math.cos(i / 24) * 10 + (rng.next() - 0.5) * 2,
          pressure: 1013 + Math.sin(i / 48) * 5 + (rng.next() - 0.5),
          battery: 93 - day * 0.5,
          created_at: timestamp,
        });
      }
    }

    // January 2026 (hourly readings) - 31 days × 24 = 744 readings
    for (let day = 1; day <= 31; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(Date.UTC(2026, 0, day, hour, 0, 0));
        deviceReadings.push({
          device: deviceId,
          temperature:
            baseTemp + Math.sin(day / 7) * 5 + (rng.next() - 0.5) * 2,
          humidity:
            baseHumidity + Math.cos(day / 7) * 15 + (rng.next() - 0.5) * 3,
          pressure: 1013 + Math.sin(day / 15) * 7 + (rng.next() - 0.5),
          battery: 90,
          created_at: timestamp,
        });
      }
    }

    // December 2025 (daily readings) - 31 readings
    for (let day = 1; day <= 31; day++) {
      const timestamp = new Date(2025, 11, day, 12, 0, 0);
      deviceReadings.push({
        device: deviceId,
        temperature:
          baseTemp - 5 + Math.sin(day / 7) * 3 + (rng.next() - 0.5) * 2,
        humidity:
          baseHumidity - 10 + Math.cos(day / 7) * 10 + (rng.next() - 0.5) * 3,
        pressure: 1015 + Math.sin(day / 15) * 5 + (rng.next() - 0.5),
        battery: 85,
        created_at: timestamp,
      });
    }

    // 2025 months (one reading per month, excluding December which has daily data) - 11 readings
    for (let month = 0; month < 11; month++) { // Skip December (month 11) to avoid duplicates
      const timestamp = new Date(Date.UTC(2025, month, 15, 12, 0, 0));
      deviceReadings.push({
        device: deviceId,
        temperature:
          baseTemp +
          Math.sin((month / 6) * Math.PI) * 10 +
          (rng.next() - 0.5) * 2,
        humidity:
          baseHumidity +
          Math.cos((month / 6) * Math.PI) * 20 +
          (rng.next() - 0.5) * 3,
        pressure:
          1013 + Math.sin((month / 12) * Math.PI) * 8 + (rng.next() - 0.5),
        battery: 80 - month,
        created_at: timestamp,
      });
    }

    return deviceReadings;
  };

  // Create seeded random generators for each device (deterministic)
  const rng001 = new SeededRandom(1);
  const rng002 = new SeededRandom(2);
  const rng003 = new SeededRandom(3);

  // Create readings for device-001 (indoor - warmer, moderate humidity)
  readings.push(...createReadings('device-001', 21, 45, rng001));

  // Create readings for device-002 (outdoor - cooler, higher humidity)
  readings.push(...createReadings('device-002', 8, 65, rng002));

  // Create readings for device-003 (disabled device - fewer recent readings)
  readings.push(...createReadings('device-003', 20, 50, rng003));

  // Insert readings in batches of 1000 to avoid query size limits
  const batchSize = 1000;
  for (let i = 0; i < readings.length; i += batchSize) {
    const batch = readings.slice(i, i + batchSize);
    await knex('reading').insert(batch);
    readingCount += batch.length;
  }

  console.log(
    `✓ Seeded ${readingCount} readings (${Math.floor(
      readingCount / 3
    )} per device)`
  );

  // Update devices with latest_reading reference
  for (const device of devices) {
    if (!device.disabled) {
      const latestReading = await knex('reading')
        .where('device', device.id)
        .orderBy('created_at', 'desc')
        .first();

      if (latestReading) {
        await knex('device')
          .where('id', device.id)
          .update({ latest_reading: latestReading.id });
      }
    }
  }
  console.log('✓ Updated device latest_reading references');

  // ============================================
  // SEED USER
  // ============================================
  const { salt, passwordHash } = saltHashPassword('testpassword');
  await knex('user').insert({
    username: 'testuser',
    password: passwordHash,
    salt: salt,
    disabled: false,
  });
  console.log('✓ Seeded 1 user (testuser / testpassword)');

  // ============================================
  // SEED API KEY
  // ============================================
  await knex('auth').insert({
    api_key: 'test-api-key-12345',
    device: null,
    description: 'Test API key for sensor-data-sender',
  });
  console.log('✓ Seeded 1 API key (test-api-key-12345)');

  console.log('\n✅ Seed complete!');
  console.log(
    `📊 Total: 3 devices, ${readingCount} readings, 1 user, 1 API key\n`
  );
}
