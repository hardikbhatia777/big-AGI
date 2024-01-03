import * as React from 'react';

import { Box, ListDivider, ListItemDecorator, MenuItem, Typography } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import { DConversationId, useConversationsByFolder } from '~/common/state/store-chats';
import { OpenAIIcon } from '~/common/components/icons/OpenAIIcon';
import { PageDrawerList, PageDrawerTallItemSx } from '~/common/layout/optima/components/PageDrawerList';
import { useFolderStore } from '~/common/state/store-folders';
import { useOptimaDrawers } from '~/common/layout/optima/useOptimaDrawers';
import { useUIPreferencesStore } from '~/common/state/store-ui';
import { useUXLabsStore } from '~/common/state/store-ux-labs';

import { ChatNavigationItemMemo } from './ChatNavigationItem';
import { ChatFolderList } from './folder/ChatFolderList';

// type ListGrouping = 'off' | 'persona';

export const ChatDrawerContentMemo = React.memo(ChatDrawerItems);

function ChatDrawerItems(props: {
  activeConversationId: DConversationId | null,
  disableNewButton: boolean,
  onConversationActivate: (conversationId: DConversationId) => void,
  onConversationDelete: (conversationId: DConversationId, bypassConfirmation: boolean) => void,
  onConversationImportDialog: () => void,
  onConversationNew: () => void,
  onConversationsDeleteAll: (folderId: string | null) => void,
  selectedFolderId: string | null,
  setSelectedFolderId: (folderId: string | null) => void,
}) {

  // local state
  const { onConversationDelete, onConversationNew, onConversationActivate } = props;
  // const [grouping] = React.useState<ListGrouping>('off');
  const { selectedFolderId, setSelectedFolderId } = props;

  // external state
  const { closeDrawerOnMobile } = useOptimaDrawers();
  //const conversations = useChatStore(state => state.conversations, shallow);
  const conversations = useConversationsByFolder(selectedFolderId);
  const showSymbols = useUIPreferencesStore(state => state.zenMode !== 'cleaner');
  const labsEnhancedUI = useUXLabsStore(state => state.labsEnhancedUI);
  const createFolder = useFolderStore((state) => state.createFolder);

  // derived state
  const maxChatMessages = conversations.reduce((longest, _c) => Math.max(longest, _c.messages.length), 1);
  const totalConversations = conversations.length;
  const hasChats = totalConversations > 0;
  const singleChat = totalConversations === 1;
  const softMaxReached = totalConversations >= 50;


  const handleButtonNew = React.useCallback(() => {
    onConversationNew();
    closeDrawerOnMobile();
  }, [closeDrawerOnMobile, onConversationNew]);

  const handleConversationActivate = React.useCallback((conversationId: DConversationId, closeMenu: boolean) => {
    onConversationActivate(conversationId);
    if (closeMenu)
      closeDrawerOnMobile();
  }, [closeDrawerOnMobile, onConversationActivate]);

  const handleConversationDelete = React.useCallback((conversationId: DConversationId) => {
    !singleChat && conversationId && onConversationDelete(conversationId, true);
  }, [onConversationDelete, singleChat]);

  const handleFolderSelect = (folderId: string | null) => {
    // Logic to handle folder selection
    setSelectedFolderId(folderId);
  };

  // grouping
  /*let sortedIds = conversationIDs;
  if (grouping === 'persona') {
    const conversations = useChatStore.getState().conversations;

    // group conversations by persona
    const groupedConversations: { [personaId: string]: string[] } = {};
    conversations.forEach(conversation => {
      const persona = conversation.systemPurposeId;
      if (persona) {
        if (!groupedConversations[persona])
          groupedConversations[persona] = [];
        groupedConversations[persona].push(conversation.id);
      }
    });

    // flatten grouped conversations
    sortedIds = Object.values(groupedConversations).flat();
  }*/

  return <>

    {/*<ListItem>*/}
    {/*  <Typography level='body-sm'>*/}
    {/*    Active chats*/}
    {/*  </Typography>*/}
    {/*</ListItem>*/}

    <ChatFolderList
      onFolderSelect={handleFolderSelect}
      folders={useFolderStore((state) => state.folders)}
      selectedFolderId={selectedFolderId}
      conversationsByFolder={conversations}
    />

    <ListDivider />

    <PageDrawerList variant='plain' noTopPadding noBottomPadding tallRows>

      <MenuItem disabled={props.disableNewButton} onClick={handleButtonNew} sx={PageDrawerTallItemSx}>
        <ListItemDecorator><AddIcon /></ListItemDecorator>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          New
          {/*<KeyStroke combo='Ctrl + Alt + N' />*/}
        </Box>
      </MenuItem>

      <ListDivider sx={{ mt: 0 }} />

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/*<ListItem sticky sx={{ justifyContent: 'space-between', boxShadow: 'sm' }}>*/}
        {/*  <Typography level='body-sm'>*/}
        {/*    Conversations*/}
        {/*  </Typography>*/}
        {/*  <ToggleButtonGroup variant='soft' size='sm' value={grouping} onChange={(_event, newValue) => newValue && setGrouping(newValue)}>*/}
        {/*    <IconButton value='off'>*/}
        {/*      <AccessTimeIcon />*/}
        {/*    </IconButton>*/}
        {/*    <IconButton value='persona'>*/}
        {/*      <PersonIcon />*/}
        {/*    </IconButton>*/}
        {/*  </ToggleButtonGroup>*/}
        {/*</ListItem>*/}

        {conversations.map(conversation =>
          <ChatNavigationItemMemo
            key={'nav-' + conversation.id}
            conversation={conversation}
            isActive={conversation.id === props.activeConversationId}
            isLonely={singleChat}
            maxChatMessages={(labsEnhancedUI || softMaxReached) ? maxChatMessages : 0}
            showSymbols={showSymbols}
            onConversationActivate={handleConversationActivate}
            onConversationDelete={handleConversationDelete}
          />)}
      </Box>

      <ListDivider sx={{ mt: 0 }} />

      <MenuItem onClick={props.onConversationImportDialog}>
        <ListItemDecorator>
          <FileUploadIcon />
        </ListItemDecorator>
        Import chats
        <OpenAIIcon sx={{ fontSize: 'xl', ml: 'auto' }} />
      </MenuItem>

      <MenuItem disabled={!hasChats} onClick={() => props.onConversationsDeleteAll(selectedFolderId)}>
        <ListItemDecorator><DeleteOutlineIcon /></ListItemDecorator>
        <Typography>
          Delete {totalConversations >= 2 ? `all ${totalConversations} chats` : 'chat'}
        </Typography>
      </MenuItem>

    </PageDrawerList>

  </>;
}