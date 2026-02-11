import { inngest } from "./client";
import { limitOrderService } from "../../services/limitOrderService";

export const limitOrderMonitorWorker = inngest.createFunction(
  {
    id: "limit-order-monitor",
    name: "Monitor Limit Orders",
  },
  [
    { cron: "*/5 * * * *" },
    { event: "limit-order/monitor" },
  ],
  async ({ step }) => {
    console.log("📊 [LimitOrderWorker] Starting order monitoring...");
    
    const result = await step.run("monitor-active-orders", async () => {
      return await limitOrderService.monitorAllActiveOrders();
    });
    
    console.log(`✅ [LimitOrderWorker] Monitoring complete: ${result.ordersChecked} checked, ${result.ordersExecuted} triggered, ${result.errors} errors`);
    
    return {
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    };
  }
);
