/*
  Warnings:

  - Added the required column `created_by` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `games` ADD COLUMN `created_by` INTEGER NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `board_state` JSON NULL;

-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
