-- Kolom yang tidak pernah dibaca aplikasi dan tidak berisi informasi:
-- is_urgent selalu 0, status selalu "completed", session_date selalu = DATE(created_at).

-- AlterTable
ALTER TABLE `production_sessions` DROP COLUMN `session_date`,
    DROP COLUMN `status`;

-- AlterTable
ALTER TABLE `recipes` DROP COLUMN `is_urgent`;
