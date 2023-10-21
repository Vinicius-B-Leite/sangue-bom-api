-- CreateTable
CREATE TABLE "Users" (
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT,
    "bloodType" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "BloodCollectors" (
    "uid" TEXT NOT NULL,
    "imageURL" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "adress" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "BloodCollectors_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Posts" (
    "id" TEXT NOT NULL,
    "bannerURL" TEXT NOT NULL,
    "linkRedirect" TEXT NOT NULL,
    "adress" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bloodCollectorsID" TEXT NOT NULL,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "bloodTypes" TEXT[],
    "bloodCollectorsID" TEXT NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questions" (
    "id" TEXT NOT NULL,
    "questions" TEXT NOT NULL,
    "answare" TEXT NOT NULL,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alert_bloodCollectorsID_key" ON "Alert"("bloodCollectorsID");

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_bloodCollectorsID_fkey" FOREIGN KEY ("bloodCollectorsID") REFERENCES "BloodCollectors"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_bloodCollectorsID_fkey" FOREIGN KEY ("bloodCollectorsID") REFERENCES "BloodCollectors"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
