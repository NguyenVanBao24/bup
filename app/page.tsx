'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const dataField = ['Tên', 'id'];

// Định nghĩa kiểu dữ liệu trả về từ API
type ApiResponse = {
  status: number;
  data: string[];
};

const FormSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  employeeId: z.string().min(2, {
    message: 'Employee ID must be at least 2 characters.',
  }),
});

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null); // State lưu dữ liệu API với kiểu rõ ràng
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State kiểm soát AlertDialog

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      employeeId: '',
    },
  });

  // Mở AlertDialog khi data thay đổi
  useEffect(() => {
    if (data) {
      setIsDialogOpen(true);
    }
  }, [data]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log('Form Data:', data);

    try {
      const response = await fetch(`https://bup-be.vercel.app/api/find-value?name=${data.username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('API Response:', result);
      setData(result); // Lưu kết quả API vào state
    } catch (error) {
      console.log(error);
    }

    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  const handleReset = () => {
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <div className='container mx-auto p-6 max-w-md'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-2/3 space-y-6'
        >
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ tên</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Nhập đầy đủ họ tên'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='employeeId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã nhân viên</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Nhập mã nhân viên'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Submit</Button>
        </form>
      </Form>

      <AlertDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle></AlertDialogTitle>
            {data && data.status === 200 ? (
              data.data.map((item: string, index: number) => <AlertDialogDescription key={index}>{`${dataField[index]}: ${item}`}</AlertDialogDescription>)
            ) : (
              <AlertDialogDescription>Không tồn tại nhân viên</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleReset}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
