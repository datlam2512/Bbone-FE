import { useState } from 'react'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { Field } from '@/shared/components/ui/Workflow'
export default function PasswordField({
  label = 'Mật khẩu',
  name = 'password',
  newPassword = false,
}) {
  const [visible, setVisible] = useState(false)
  return (
    <VStackField
      label={label}
      name={name}
      newPassword={newPassword}
      visible={visible}
      toggle={() => setVisible(!visible)}
    />
  )
}
function VStackField({ label, name, newPassword, visible, toggle }) {
  return (
    <section className="space-y-2">
      <Field
        label={label}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={newPassword ? 'new-password' : 'current-password'}
        required
        minLength={newPassword ? 12 : undefined}
        maxLength={128}
      />
      <HStack hAlign="between" vAlign="center" gap={3}>
        <p className="text-xs text-slate-500">
          {newPassword ? 'Từ 12 đến 128 ký tự.' : 'Giữ riêng mật khẩu của bạn.'}
        </p>
        <Button
          label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          variant="ghost"
          size="sm"
          onClick={toggle}
        />
      </HStack>
    </section>
  )
}
