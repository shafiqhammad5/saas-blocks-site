-- AlterTable
ALTER TABLE "public"."Block" ADD COLUMN     "authorId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Block" ADD CONSTRAINT "Block_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
