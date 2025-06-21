-- CreateTable
CREATE TABLE "Address" (
    "address_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "address_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "subdistrict" TEXT,
    "city" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "province_id" TEXT NOT NULL,
    "postcode" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("address_id")
);

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
