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

const monthField = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'restUse', 'restNotUse'];

type DataResponse = {
  EmployeeId?: string;
  EmployeeName?: string;
  position?: string;
  [key: string]: string | undefined; // Cho phép động các trường tháng
};

type ApiResponse = {
  status: number;
  data: DataResponse;
};

const FormSchema = z.object({
  username: z.string().min(1, {
    message: 'Username must be at least 1 character.',
  }),
});

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
    },
  });

  useEffect(() => {
    if (data) setIsDialogOpen(true);
  }, [data]);

  async function onSubmit(formData: z.infer<typeof FormSchema>) {
    try {
      const response = await fetch('https://bup-be.vercel.app/api/find-value', {
        // const response = await fetch('http://localhost:3001/api/find-value', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: formData.username }),
      });

      const result = await response.json();
      console.log('API Response:', result);

      setData(result);
    } catch (error) {
      console.error('Fetch Error:', error);
    }

    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className='mt-2 w-[1000px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(formData, null, 2)}</code>
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
          className='w-full space-y-6'
        >
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Nhập Tên'
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
        <AlertDialogContent className='max-w-md overflow-x-auto'>
          <AlertDialogHeader>
            <AlertDialogTitle>Thông tin nhân viên</AlertDialogTitle>
            {data && data?.status === 200 ? (
              <div>
                <AlertDialogDescription>
                  <strong>Mã Nhân viên:</strong> {data.data.EmployeeId}
                </AlertDialogDescription>
                <AlertDialogDescription>
                  <strong>Tên Nhân viên:</strong> {data.data.EmployeeName}
                </AlertDialogDescription>
                <AlertDialogDescription>
                  <strong>Chức vụ:</strong> {data.data.position}
                </AlertDialogDescription>
                <div className='overflow-x-auto mt-4'>
                  <table className='w-full border-collapse border border-gray-300'>
                    <tbody>
                      {monthField?.map((field, index) => (
                        <tr
                          key={index}
                          className='even:bg-gray-50'
                        >
                          <td className='border border-gray-300 p-2 font-medium bg-gray-100'>{field}</td>
                          <td className='border border-gray-300 p-2'>{data.data[field] || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <AlertDialogDescription>{data?.status == 429 ? 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút' : 'Không tồn tại nhân viên'}</AlertDialogDescription>
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
