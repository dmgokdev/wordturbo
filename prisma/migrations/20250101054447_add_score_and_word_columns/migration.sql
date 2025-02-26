-- AlterTable
ALTER TABLE `players` ADD COLUMN `found_word` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `score` INTEGER NOT NULL DEFAULT 0;
