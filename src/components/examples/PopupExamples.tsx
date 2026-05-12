'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Popup } from '@/components/ui/Popup'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Drawer } from '@/components/ui/Drawer'
import { ToastContainer } from '@/components/ui/Toast'
import { useModal } from '@/hooks/useModal'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { Input } from '@/components/ui/Input'

export function PopupExamples() {
  // Modal hooks
  const basicModal = useModal()
  const successModal = useModal()
  const warningModal = useModal()
  const errorModal = useModal()
  const largeModal = useModal()

  // Popup hooks
  const centerPopup = useModal()
  const topRightPopup = useModal()
  const bottomLeftPopup = useModal()
  const autoClosePopup = useModal()

  // Drawer hooks
  const rightDrawer = useModal()
  const leftDrawer = useModal()
  const topDrawer = useModal()
  const bottomDrawer = useModal()

  // Toast and confirm hooks
  const { toasts, success, error, warning, info } = useToast()
  const confirm = useConfirm()

  const handleDeleteAction = () => {
    confirm.confirm(
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        success('Item deleted successfully!')
      },
      {
        title: 'Delete Item',
        message: 'Are you sure you want to delete this item? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger'
      }
    )
  }

  const handleWarningAction = () => {
    confirm.confirm(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        warning('Action completed with warnings')
      },
      {
        title: 'Proceed with Caution',
        message: 'This action may have unintended consequences. Do you want to continue?',
        confirmText: 'Proceed',
        variant: 'warning'
      }
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Popup Components Showcase</h1>
        <p className="text-gray-600">
          Comprehensive collection of popup, modal, drawer, and notification components
        </p>
      </div>

      {/* Modals Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
          Modals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button onClick={basicModal.openModal}>Basic Modal</Button>
          <Button onClick={successModal.openModal} variant="primary">Success Modal</Button>
          <Button onClick={warningModal.openModal} variant="outline">Warning Modal</Button>
          <Button onClick={errorModal.openModal} variant="danger">Error Modal</Button>
          <Button onClick={largeModal.openModal} variant="secondary">Large Modal</Button>
        </div>
      </section>

      {/* Popups Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
          Popups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button onClick={centerPopup.openModal}>Center Popup</Button>
          <Button onClick={topRightPopup.openModal}>Top Right</Button>
          <Button onClick={bottomLeftPopup.openModal}>Bottom Left</Button>
          <Button onClick={autoClosePopup.openModal}>Auto Close</Button>
        </div>
      </section>

      {/* Drawers Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
          Drawers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button onClick={rightDrawer.openModal}>Right Drawer</Button>
          <Button onClick={leftDrawer.openModal}>Left Drawer</Button>
          <Button onClick={topDrawer.openModal}>Top Drawer</Button>
          <Button onClick={bottomDrawer.openModal}>Bottom Drawer</Button>
        </div>
      </section>

      {/* Toasts Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
          Toast Notifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button onClick={() => success('Operation completed successfully!')}>
            Success Toast
          </Button>
          <Button onClick={() => error('Something went wrong!')}>
            Error Toast
          </Button>
          <Button onClick={() => warning('Please check your input')}>
            Warning Toast
          </Button>
          <Button onClick={() => info('Here\'s some useful information')}>
            Info Toast
          </Button>
        </div>
      </section>

      {/* Confirm Dialogs Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
          Confirmation Dialogs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={handleDeleteAction} variant="danger">
            Delete with Confirmation
          </Button>
          <Button onClick={handleWarningAction} variant="outline">
            Warning Confirmation
          </Button>
        </div>
      </section>

      {/* Modal Components */}
      <Modal
        isOpen={basicModal.isOpen}
        onClose={basicModal.closeModal}
        title="Basic Modal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is a basic modal with standard styling. It includes a backdrop blur effect
            and smooth animations.
          </p>
          <div className="space-y-3">
            <Input placeholder="Enter your name" />
            <Input placeholder="Enter your email" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={basicModal.closeModal}>
              Cancel
            </Button>
            <Button onClick={basicModal.closeModal}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={successModal.isOpen}
        onClose={successModal.closeModal}
        title="Success!"
        variant="success"
        size="sm"
      >
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Your action has been completed successfully. Everything is working as expected.
          </p>
          <Button onClick={successModal.closeModal} className="w-full">
            Continue
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={warningModal.isOpen}
        onClose={warningModal.closeModal}
        title="Warning"
        variant="warning"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please review the following warnings before proceeding with your action.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>This action may affect other users</li>
            <li>Changes cannot be undone</li>
            <li>System performance may be impacted</li>
          </ul>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={warningModal.closeModal}>
              Cancel
            </Button>
            <Button variant="outline" onClick={warningModal.closeModal}>
              Proceed Anyway
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={errorModal.isOpen}
        onClose={errorModal.closeModal}
        title="Error Occurred"
        variant="error"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            An error has occurred while processing your request. Please try again or contact support.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <code className="text-sm text-red-800">
              Error: Network connection timeout (Code: 408)
            </code>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={errorModal.closeModal}>
              Close
            </Button>
            <Button onClick={errorModal.closeModal}>
              Retry
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={largeModal.isOpen}
        onClose={largeModal.closeModal}
        title="Large Modal with Form"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <Input placeholder="Enter first name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <Input placeholder="Enter last name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input type="email" placeholder="Enter email address" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows={4}
              placeholder="Enter your message..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={largeModal.closeModal}>
              Cancel
            </Button>
            <Button onClick={largeModal.closeModal}>
              Submit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Popup Components */}
      <Popup
        isOpen={centerPopup.isOpen}
        onClose={centerPopup.closeModal}
        title="Center Popup"
        message="This popup appears in the center of the screen with a backdrop."
        position="center"
        variant="info"
      />

      <Popup
        isOpen={topRightPopup.isOpen}
        onClose={topRightPopup.closeModal}
        title="Notification"
        message="This is a notification popup that appears in the top-right corner."
        position="top-right"
        variant="success"
      />

      <Popup
        isOpen={bottomLeftPopup.isOpen}
        onClose={bottomLeftPopup.closeModal}
        title="Warning"
        message="This warning popup appears in the bottom-left corner."
        position="bottom-left"
        variant="warning"
      />

      <Popup
        isOpen={autoClosePopup.isOpen}
        onClose={autoClosePopup.closeModal}
        title="Auto Close"
        message="This popup will automatically close after 3 seconds."
        position="top"
        variant="info"
        autoClose={3000}
      />

      {/* Drawer Components */}
      <Drawer
        isOpen={rightDrawer.isOpen}
        onClose={rightDrawer.closeModal}
        title="Right Drawer"
        position="right"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is a right-side drawer. Perfect for forms, details, or navigation.
          </p>
          <div className="space-y-3">
            <Input placeholder="Search..." />
            <div className="space-y-2">
              {['Option 1', 'Option 2', 'Option 3'].map((option) => (
                <div key={option} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  {option}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Drawer>

      <Drawer
        isOpen={leftDrawer.isOpen}
        onClose={leftDrawer.closeModal}
        title="Left Drawer"
        position="left"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Navigation drawer on the left side.</p>
          <nav className="space-y-2">
            {['Dashboard', 'Users', 'Settings', 'Reports'].map((item) => (
              <a key={item} href="#" className="block p-2 hover:bg-gray-100 rounded-lg">
                {item}
              </a>
            ))}
          </nav>
        </div>
      </Drawer>

      <Drawer
        isOpen={topDrawer.isOpen}
        onClose={topDrawer.closeModal}
        title="Top Drawer"
        position="top"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Top drawer is great for notifications or quick actions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button size="sm">Action 1</Button>
            <Button size="sm" variant="secondary">Action 2</Button>
            <Button size="sm" variant="outline">Action 3</Button>
          </div>
        </div>
      </Drawer>

      <Drawer
        isOpen={bottomDrawer.isOpen}
        onClose={bottomDrawer.closeModal}
        title="Bottom Drawer"
        position="bottom"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bottom drawer works well for mobile interfaces and quick forms.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Quick input 1" />
            <Input placeholder="Quick input 2" />
          </div>
          <Button className="w-full">Submit</Button>
        </div>
      </Drawer>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={confirm.handleCancel}
        onConfirm={confirm.handleConfirm}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        variant={confirm.variant}
        loading={confirm.loading}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} position="top-right" />
    </div>
  )
}