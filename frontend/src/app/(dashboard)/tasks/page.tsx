'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useGetTasks, useCreateTask, useUpdateTask, useUpdateTaskStatus, useDeleteTask } from '@/hooks/useTasks';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants/leadStatus';
import type { Task, TaskFormData, TaskStatus, TaskPriority } from '@/constants/leadStatus';

const PRIORITY_BADGE: Record<TaskPriority, 'success' | 'warning' | 'error'> = {
  Low: 'success',
  Medium: 'warning',
  High: 'error',
};

const taskFormSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters'),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  priority: z.enum(['Low', 'Medium', 'High'] as const),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['Pending', 'In Progress', 'Completed'] as const),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<TaskStatus>('Pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const { data, isLoading, isError } = useGetTasks({ status: activeTab, limit: 50 });
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const updateStatusMutation = useUpdateTaskStatus();
  const deleteMutation = useDeleteTask();

  const tasks = data?.data || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
  });

  const openCreateModal = useCallback(() => {
    setEditingTask(null);
    reset({ title: '', description: '', priority: 'Medium', dueDate: '', status: 'Pending' });
    setModalOpen(true);
  }, [reset]);

  const openEditModal = useCallback((task: Task) => {
    setEditingTask(task);
    reset({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      status: task.status,
    });
    setModalOpen(true);
  }, [reset]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingTask(null);
  }, []);

  const onSubmit = useCallback(async (values: TaskFormValues) => {
    try {
      if (editingTask) {
        await updateMutation.mutateAsync({ id: editingTask._id, ...values });
        toast.success('Task updated');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Task created');
      }
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [editingTask, createMutation, updateMutation, closeModal]);

  const handleStatusToggle = useCallback(async (task: Task) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      'Pending': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'Pending',
    };
    try {
      await updateStatusMutation.mutateAsync({ id: task._id, status: nextStatus[task.status] });
      toast.success(`Task moved to ${nextStatus[task.status]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update task');
    }
  }, [updateStatusMutation]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingTask) return;
    try {
      await deleteMutation.mutateAsync(deletingTask._id);
      toast.success('Task deleted');
      setDeletingTask(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [deletingTask, deleteMutation]);

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8">
      <section className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Tasks</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage your tasks and stay organized.</p>
        </div>
        <Button onClick={openCreateModal}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Task
        </Button>
      </section>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex gap-1 border-b border-outline-variant/20">
            {TASK_STATUSES.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-label-md text-label-md transition-all border-b-2 -mb-[1px] ${
                  activeTab === tab
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-surface-container-low rounded-xl animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-6xl text-error mb-4">cloud_off</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mb-1">Failed to load tasks</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">task_alt</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mb-1">No tasks in {activeTab}</p>
              <p className="text-body-md text-on-surface-variant">Create a new task to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleStatusToggle(task)}
                          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            task.status === 'Completed'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-outline-variant hover:border-primary'
                          }`}
                        >
                          {task.status === 'Completed' && (
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          )}
                        </button>
                        <div className="min-w-0">
                          <p className={`font-label-md text-label-md text-primary ${task.status === 'Completed' ? 'line-through text-on-surface-variant' : ''}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <Badge variant={PRIORITY_BADGE[task.priority]}>{task.priority}</Badge>
                            {task.dueDate && (
                              <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                {format(new Date(task.dueDate), 'MMM d, yyyy')}
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                              task.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                              'bg-surface-container-highest text-on-surface-variant'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEditModal(task)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => setDeletingTask(task)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onClose={closeModal} title={editingTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Title" placeholder="Follow up with client" error={errors.title?.message} {...register('title')} />
          <Textarea label="Description" placeholder="Task details..." rows={3} error={errors.description?.message} {...register('description')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Priority" options={TASK_PRIORITIES.map((p) => ({ value: p, label: p }))} error={errors.priority?.message} {...register('priority')} />
            <Select label="Status" options={TASK_STATUSES.map((s) => ({ value: s, label: s }))} error={errors.status?.message} {...register('status')} />
          </div>
          <Input label="Due Date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={isFormSubmitting}>
              {isFormSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {editingTask ? 'Updating...' : 'Creating...'}
                </span>
              ) : editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete ${deletingTask?.title ?? 'this task'}?`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
