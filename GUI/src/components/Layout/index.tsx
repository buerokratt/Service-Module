import { Header, useMenuCountConf } from '@buerokratt-ria/header';
import { MainNavigation } from '@buerokratt-ria/menu';
import React, { FC, PropsWithChildren, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import useToastStore from 'store/toasts.store';

import useStore from '../../store/store';
import './Layout.scss';

type LayoutProps = {
  disableMenu?: boolean;
  customHeader?: ReactNode;
};

const Layout: FC<PropsWithChildren<LayoutProps>> = ({ disableMenu, customHeader, children }) => {
  const menuCountConf = useMenuCountConf();

  return (
    <div className="layout">
      {!disableMenu && <MainNavigation countConf={menuCountConf} />}
      <div className="layout__wrapper">
        {customHeader ?? (
          <Header
            toastContext={{ open: useToastStore.getState().open }}
            user={useStore.getState().userInfo}
            setUserDomains={useStore.getState().setUserDomains}
          />
        )}
        <main className="layout__main">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
};

export default Layout;
