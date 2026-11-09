import { Link } from 'react-router-dom'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useCommand } from '@/shared/hooks/use-command'
import { Feedback } from './Workflow'
export default function FavoriteButton({ kind, targetId }) {
  const user = useAuthStore((s) => s.user),
    command = useCommand()
  if (!user)
    return (
      <Link to="/dang-nhap" className="text-sm text-slate-500">
        Đăng nhập để lưu yêu thích
      </Link>
    )
  return (
    <>
      <Button
        label="Lưu yêu thích"
        variant="ghost"
        isLoading={command.pending}
        onClick={() =>
          command.run(
            () => api.post('/me/favorites', { kind, targetId }),
            { kind, targetId },
            'Đã lưu vào danh sách yêu thích.',
          )
        }
      />
      <Feedback command={command} />
    </>
  )
}
