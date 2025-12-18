import { Dialog, Transition } from '@headlessui/react';
import type { CSSProperties, HTMLAttributes, PropsWithChildren } from 'react';
import { Fragment } from 'react';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
    panelClassName = '',
    panelStyle,
    panelProps = {},
}: PropsWithChildren<{
    show: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    closeable?: boolean;
    onClose: CallableFunction;
    panelClassName?: string;
    panelStyle?: CSSProperties;
    panelProps?: HTMLAttributes<HTMLDivElement>;
}>) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return (
        <Transition show={show} leave="duration-200" as={Fragment}>
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 z-[9999] overflow-y-auto"
                onClose={close}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 z-[9998] bg-gray-900/70" />
                </Transition.Child>

                <div className="grid min-h-full w-full place-items-center p-4 sm:p-6">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <Dialog.Panel
                            className={`w-full transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all ${maxWidthClass} ${panelClassName}`}
                            style={{ ...(panelProps.style ?? {}), ...(panelStyle ?? {}) }}
                            {...panelProps}
                        >
                            {children}
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
