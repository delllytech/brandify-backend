import express from "express";
import bodyParser from "body-parser";
import cors from "cors"; // Import the cors package
import authRoutes from "./features/auth/authRoutes";
import packageRoutes from './features/package/packageRoutes'
import workerRoutes from './features/works/workRoutes'
import messageRouter from "./features/messages/messageRoutes";
import offerRouter from "./features/offer/offerRoutes";
import faqRouter from "./features/faq/faqRoutes"
import reviewRouter from "./features/review/reviewRoutes";
import jobRouter from "./features/job/jobRoutes";
import dashboardRouter from "./features/dashboard/dashboardRoutes";
import orderRouter from "./features/orders/orderRoutes";
import { authenticateToken } from "./middleware";
import cookieParser from 'cookie-parser';

const app = express();



// CORS Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'https://brandifyguru.com'], // Add your frontend URL(s)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Enable credentials (cookies, authorization headers, etc.)
}));



app.use(cookieParser());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(bodyParser.json());
app.use("/auth", authRoutes);
app.use("/api", packageRoutes);
app.use("/api", workerRoutes);
app.use("/api", messageRouter);
app.use("/api", offerRouter);
app.use("/api", faqRouter);
app.use("/api", reviewRouter);
app.use("/api", jobRouter);
app.use("/api", dashboardRouter)
app.use("/api", orderRouter)


export default app;