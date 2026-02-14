import axios from "axios";
import { AppError } from "../middleware/errorHandler";

interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
  environment: "sandbox" | "production";
}

interface PesapalAuthResponse {
  token: string;
  expiryDate: string;
  error?: any;
  status: string;
  message: string;
}

interface PesapalOrderRequest {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address: string;
    phone_number?: string;
    first_name: string;
    last_name?: string;
  };
}

interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: any;
  status: string;
}

interface PesapalTransactionStatus {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  payment_status_description: string;
  description: string;
  message: string;
  payment_account: string;
  call_back_url: string;
  status_code: number;
  merchant_reference: string;
  currency: string;
  error?: any;
  status: string;
}

interface PesapalIPNRegistration {
  url: string;
  ipn_id: string;
  error?: any;
  status: string;
}

class PesapalService {
  private config: PesapalConfig;
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.config = {
      consumerKey: process.env.PESAPAL_CONSUMER_KEY || "",
      consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || "",
      environment:
        (process.env.PESAPAL_ENVIRONMENT as "sandbox" | "production") ||
        "sandbox",
    };

    this.baseUrl =
      this.config.environment === "production"
        ? "https://pay.pesapal.com/v3"
        : "https://cybqa.pesapal.com/pesapalv3";
  }

  private async getAuthToken(): Promise<string | null> {
    // Check if token is still valid
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await axios.post<PesapalAuthResponse>(
        `${this.baseUrl}/api/Auth/RequestToken`,
        {
          consumer_key: this.config.consumerKey,
          consumer_secret: this.config.consumerSecret,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (response.data.error || response.data.status !== "200") {
        throw new AppError(
          response.data.message || "Failed to authenticate with Pesapal",
          500,
        );
      }

      this.token = response.data.token;
      this.tokenExpiry = new Date(response.data.expiryDate);

      return this.token;
    } catch (error: any) {
      console.error(
        "Pesapal auth error:",
        error.response?.data || error.message,
      );
      throw new AppError("Failed to authenticate with Pesapal", 500);
    }
  }

  async registerIPN(
    url: string,
    ipnNotificationType: "GET" | "POST" = "POST",
  ): Promise<PesapalIPNRegistration> {
    const token = await this.getAuthToken();

    try {
      const response = await axios.post<PesapalIPNRegistration>(
        `${this.baseUrl}/api/URLSetup/RegisterIPN`,
        {
          url,
          ipn_notification_type: ipnNotificationType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (response.data.error || response.data.status !== "200") {
        throw new AppError("Failed to register IPN URL", 500);
      }

      return response.data;
    } catch (error: any) {
      console.error(
        "Pesapal IPN registration error:",
        error.response?.data || error.message,
      );
      throw new AppError("Failed to register IPN URL with Pesapal", 500);
    }
  }

  async getRegisteredIPNs(): Promise<any[]> {
    const token = await this.getAuthToken();

    try {
      const response = await axios.get(
        `${this.baseUrl}/api/URLSetup/GetIpnList`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Pesapal get IPNs error:",
        error.response?.data || error.message,
      );
      throw new AppError("Failed to get registered IPNs", 500);
    }
  }

  async submitOrder(
    orderRequest: PesapalOrderRequest,
  ): Promise<PesapalOrderResponse> {
    const token = await this.getAuthToken();

    try {
      const response = await axios.post<PesapalOrderResponse>(
        `${this.baseUrl}/api/Transactions/SubmitOrderRequest`,
        orderRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (response.data.error || response.data.status !== "200") {
        throw new AppError(
          response.data.error?.message || "Failed to submit order to Pesapal",
          500,
        );
      }

      return response.data;
    } catch (error: any) {
      console.error(
        "Pesapal submit order error:",
        error.response?.data || error.message,
      );
      throw new AppError("Failed to submit order to Pesapal", 500);
    }
  }

  async getTransactionStatus(
    orderTrackingId: string,
  ): Promise<PesapalTransactionStatus> {
    const token = await this.getAuthToken();

    try {
      const response = await axios.get<PesapalTransactionStatus>(
        `${this.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Pesapal transaction status error:",
        error.response?.data || error.message,
      );
      throw new AppError("Failed to get transaction status from Pesapal", 500);
    }
  }
}

export const pesapalService = new PesapalService();

export { PesapalOrderRequest, PesapalOrderResponse, PesapalTransactionStatus };
