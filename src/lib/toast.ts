import { toast } from 'sonner';

export const notify = {
  success: (msg: string, desc?: string) => {
    toast.success(msg, { description: desc, duration: 3000 });
  },
  error: (msg: string, desc?: string) => {
    toast.error(msg, { description: desc, duration: 4000 });
  },
  info: (msg: string, desc?: string) => {
    toast.info(msg, { description: desc, duration: 3000 });
  },
  warning: (msg: string, desc?: string) => {
    toast.warning(msg, { description: desc, duration: 3500 });
  },
  loading: (msg: string) => toast.loading(msg),
  dismiss: (id?: string | number) => toast.dismiss(id),
  promise: <T,>(p: Promise<T>, msgs: { loading: string; success: string; error: string }) =>
    toast.promise(p, msgs),
};
