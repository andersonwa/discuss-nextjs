'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import type { Topic } from '@prisma/client';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import paths from '@/paths';
import { revalidatePath } from 'next/cache';

const createTopicSchema = z.object({
  name: z
    .string()
    .min(3)
    .regex(/^[a-z-]+$/, { message: 'Must be lowecase' }),
  description: z.string().min(10),
});

interface createTopicFormState {
  errors: {
    name?: string[];
    description?: string[];
    _form?: string[];
  };
}

export async function createTopic(
  formState: createTopicFormState,
  formData: FormData
): Promise<createTopicFormState> {
  const result = createTopicSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const session = await auth();

  if (!session || !session.user) {
    return {
      errors: {
        _form: ['You must be logged in to create a topic'],
      },
    };
  }

  let topic: Topic;

  try {
    topic = await db.topic.create({
      data: {
        slug: result.data.name,
        description: result.data.description,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      };
    } else {
      return {
        errors: {
          _form: ['Something went wrong'],
        },
      };
    }
  }

  revalidatePath(paths.home());
  redirect(paths.topicShow(topic.slug));
}
