'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';

interface TeacherLinkProps {
  teacherId: string;
  teacherName: string;
  teacherPhoto?: string;
  className?: string;
  showAvatar?: boolean;
}

export default function TeacherLink({ 
  teacherId, 
  teacherName, 
  teacherPhoto,
  className = '',
  showAvatar = true
}: TeacherLinkProps) {
  return (
    <Link 
      href={`/teacher/${teacherId}`}
      className={`inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group ${className}`}
    >
      {showAvatar && (
        <>
          {teacherPhoto ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image 
                src={teacherPhoto} 
                alt={teacherName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </>
      )}
      <span className="font-medium group-hover:underline">
        {teacherName}
      </span>
    </Link>
  );
}
