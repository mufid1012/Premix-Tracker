-- DropForeignKey
ALTER TABLE `production_entries` DROP FOREIGN KEY `production_entries_recipe_id_fkey`;

-- AlterTable (recipe_name dibuat nullable dulu, diisi di bawah, lalu dijadikan NOT NULL)
ALTER TABLE `production_entries` ADD COLUMN `recipe_name` VARCHAR(200) NULL,
    MODIFY `recipe_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `production_entry_ingredients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entry_id` INTEGER NOT NULL,
    `ingredient_name` VARCHAR(200) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unit` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Backfill: entry lama mengambil nama dan komposisi resep saat migrasi dijalankan
UPDATE `production_entries` e
JOIN `recipes` r ON r.`id` = e.`recipe_id`
SET e.`recipe_name` = r.`name`;

INSERT INTO `production_entry_ingredients` (`entry_id`, `ingredient_name`, `quantity`, `unit`)
SELECT e.`id`, i.`ingredient_name`, i.`quantity`, i.`unit`
FROM `production_entries` e
JOIN `recipe_ingredients` i ON i.`recipe_id` = e.`recipe_id`;

ALTER TABLE `production_entries` MODIFY `recipe_name` VARCHAR(200) NOT NULL;

-- AddForeignKey
ALTER TABLE `production_entries` ADD CONSTRAINT `production_entries_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_entry_ingredients` ADD CONSTRAINT `production_entry_ingredients_entry_id_fkey` FOREIGN KEY (`entry_id`) REFERENCES `production_entries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
