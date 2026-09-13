export const logError = (context: string, error: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [ERROR] [${context}]:`, error);
};

export const logInfo = (context: string, message: string) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [INFO] [${context}]: ${message}`);
};
