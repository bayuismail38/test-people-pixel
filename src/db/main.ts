import { db } from './db.ts';
import { migration } from './run.ts';


async function main() {
  const action = process.argv[2] || 'up'; // Membaca argumen: 'up' atau 'down'
  
  console.log(`🔄 Menjalankan migrasi database dengan mode: [${action.toUpperCase()}]`);
  
  try {
    if (action === 'up') {
      for (const migrations of migration) {
          const client = await db.pool.connect();
          try {
            console.log(migrations)
            await client.query('BEGIN'); // Mulai transaksi aman
            await client.query(migrations.query);
            await client.query('COMMIT'); // Simpan permanen jika sukses
            console.log(`✅ Sukses UP: ${migrations.query}`);
          } catch (err: any) {
            await client.query('ROLLBACK'); // Batalkan semua query jika ada satu saja yang gagal
            console.error(`❌ Gagal pada ${migrations.query}. Semua perubahan dibatalkan!`);
            throw err;
          } finally {
            client.release();
          }
      }
    } 
  } catch (error: any) {
    console.log(error)
    console.error('❌ Terjadi kesalahan fatal:', error.message);
  } finally {
    process.exit();
  }
}

main();
