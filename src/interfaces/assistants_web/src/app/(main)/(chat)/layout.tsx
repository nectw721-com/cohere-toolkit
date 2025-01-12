'use client';

import { Transition } from '@headlessui/react';
import { useContext, useEffect } from 'react';

import AgentRightPanel from '@/components/Agents/AgentRightPanel';
import { BannerContext } from '@/context/BannerContext';
import { useIsDesktop } from '@/hooks/breakpoint';
import { useListAllDeployments } from '@/hooks/deployments';
import { useExperimentalFeatures } from '@/hooks/experimentalFeatures';
import { useAgentsStore, useConversationStore, useParamsStore } from '@/stores';
import { cn } from '@/utils';

const ChatLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { data: experimentalFeatures } = useExperimentalFeatures();
  const { resetConversation } = useConversationStore();
  const {
    params: { deployment },
    setParams,
  } = useParamsStore();
  const { data: allDeployments } = useListAllDeployments();

  const {
    agents: { isAgentsRightPanelOpen },
  } = useAgentsStore();
  const isDesktop = useIsDesktop();

  const isLangchainModeOn = !!experimentalFeatures?.USE_EXPERIMENTAL_LANGCHAIN;
  const { setMessage } = useContext(BannerContext);

  // Reset conversation when unmounting
  useEffect(() => {
    return () => {
      resetConversation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!deployment && allDeployments) {
      const firstAvailableDeployment = allDeployments.find((d) => d.is_available);
      if (firstAvailableDeployment) {
        setParams({ deployment: firstAvailableDeployment.name });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployment, allDeployments]);

  useEffect(() => {
    if (!isLangchainModeOn) return;
    setMessage('You are using an experimental langchain multihop flow. There will be bugs.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLangchainModeOn]);

  return (
    <div className="flex h-full">
      {children}
      <Transition
        show={isAgentsRightPanelOpen || isDesktop}
        as="div"
        className={cn('bg-mushroom-900 px-6 dark:bg-volcanic-100', {
          'w-[280px] flex-shrink-0 lg:w-[360px]': isDesktop,
          'absolute inset-0': isAgentsRightPanelOpen || !isDesktop,
        })}
        enter="transition-all transform ease-in-out duration-300"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transition-all transform ease-in-out duration-300"
        leaveFrom="translate-x-0 opacity-100"
        leaveTo="translate-x-full opacity-0"
      >
        <AgentRightPanel />
      </Transition>
    </div>
  );
};

export default ChatLayout;
