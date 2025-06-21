// src/helpers/xendit.ts
import { Xendit } from "xendit-node";

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!, // pastikan sudah diset di .env
});

const { Invoice } = xendit;

const xenditClient = { Invoice };

export default xenditClient;
