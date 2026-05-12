# Popup Components Guide

A comprehensive collection of popup, modal, drawer, and notification components that match your UI design system.

## Components Overview

### 1. Modal Component
Full-screen overlay modals with backdrop blur and smooth animations.

**Features:**
- Multiple sizes (xs, sm, md, lg, xl, full)
- Variants (default, success, warning, error, info)
- Keyboard navigation (ESC to close)
- Click outside to close
- Accessibility features

**Usage:**
```tsx
import { Modal, useModal } from '@/components/ui'

function MyComponent() {
  const modal = useModal()
  
  return (
    <>
      <Button onClick={modal.openModal}>Open Modal</Button>
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        title="My Modal"
        size="md"
        variant="success"
      >
        <p>Modal content goes here</p>
      </Modal>
    </>
  )
}
```

### 2. Popup Component
Lightweight popups that can be positioned anywhere on screen.

**Features:**
- Multiple positions (center, top, bottom, corners)
- Auto-close functionality
- No backdrop (except center position)
- Perfect for notifications

**Usage:**
```tsx
import { Popup, useModal } from '@/components/ui'

function MyComponent() {
  const popup = useModal()
  
  return (
    <>
      <Button onClick={popup.openModal}>Show Popup</Button>
      <Popup
        isOpen={popup.isOpen}
        onClose={popup.closeModal}
        title="Notification"
        message="This is a popup message"
        position="top-right"
        variant="info"
        autoClose={5000}
      />
    </>
  )
}
```

### 3. Drawer Component
Side panels that slide in from any direction.

**Features:**
- Four positions (left, right, top, bottom)
- Multiple sizes
- Perfect for navigation, forms, or details

**Usage:**
```tsx
import { Drawer, useModal } from '@/components/ui'

function MyComponent() {
  const drawer = useModal()
  
  return (
    <>
      <Button onClick={drawer.openModal}>Open Drawer</Button>
      <Drawer
        isOpen={drawer.isOpen}
        onClose={drawer.closeModal}
        title="Settings"
        position="right"
        size="md"
      >
        <div>Drawer content</div>
      </Drawer>
    </>
  )
}
```

### 4. Toast Notifications
Non-blocking notifications that appear temporarily.

**Features:**
- Auto-dismiss with customizable duration
- Multiple variants
- Position control
- Queue management

**Usage:**
```tsx
import { ToastContainer, useToast } from '@/components/ui'

function MyComponent() {
  const { toasts, success, error, warning, info } = useToast()
  
  return (
    <>
      <Button onClick={() => success('Operation completed!')}>
        Show Success
      </Button>
      <Button onClick={() => error('Something went wrong!')}>
        Show Error
      </Button>
      
      <ToastContainer toasts={toasts} position="top-right" />
    </>
  )
}
```

### 5. Confirmation Dialog
Pre-built confirmation dialogs for destructive actions.

**Features:**
- Loading states
- Multiple variants (danger, warning, etc.)
- Async action support

**Usage:**
```tsx
import { ConfirmDialog, useConfirm } from '@/components/ui'

function MyComponent() {
  const confirm = useConfirm()
  
  const handleDelete = () => {
    confirm.confirm(
      async () => {
        // Perform delete action
        await deleteItem()
      },
      {
        title: 'Delete Item',
        message: 'Are you sure? This cannot be undone.',
        variant: 'danger',
        confirmText: 'Delete'
      }
    )
  }
  
  return (
    <>
      <Button onClick={handleDelete} variant="danger">
        Delete Item
      </Button>
      
      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={confirm.handleCancel}
        onConfirm={confirm.handleConfirm}
        title={confirm.title}
        message={confirm.message}
        variant={confirm.variant}
        loading={confirm.loading}
      />
    </>
  )
}
```

## Hooks

### useModal()
Basic modal state management.

```tsx
const modal = useModal()
// Returns: { isOpen, data, openModal, closeModal, toggleModal }
```

### useToast()
Toast notification management.

```tsx
const toast = useToast()
// Returns: { toasts, addToast, removeToast, clearAllToasts, success, error, warning, info }
```

### useConfirm()
Confirmation dialog management.

```tsx
const confirm = useConfirm()
// Returns: { isOpen, loading, confirm, handleConfirm, handleCancel, ...options }
```

## Design System Integration

All components follow your existing design system:

- **Colors:** Emerald/green primary, clean white backgrounds
- **Typography:** Reem Kufi for headings, Work Sans for body text
- **Spacing:** Consistent padding and margins
- **Animations:** Smooth transitions and hover effects
- **Glass Morphism:** Backdrop blur effects
- **No Borders:** Clean shadow-based design
- **Accessibility:** Keyboard navigation, ARIA labels, focus management

## Customization

All components accept a `className` prop for additional styling:

```tsx
<Modal
  className="custom-modal-styles"
  // ... other props
>
```

You can also customize the design tokens in your CSS variables to change the overall appearance.

## Examples

Check out the comprehensive example component at `src/components/examples/PopupExamples.tsx` to see all components in action.

## Best Practices

1. **Use appropriate component types:**
   - Modals for forms and detailed content
   - Popups for quick notifications
   - Drawers for navigation and side content
   - Toasts for non-blocking feedback
   - Confirm dialogs for destructive actions

2. **Consider user experience:**
   - Don't stack multiple modals
   - Use auto-close for non-critical notifications
   - Provide clear action buttons
   - Ensure keyboard accessibility

3. **Performance:**
   - Components only render when open
   - Automatic cleanup of event listeners
   - Efficient state management with hooks