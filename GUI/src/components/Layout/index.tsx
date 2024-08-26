import React, { FC, ReactNode, PropsWithChildren } from 'react';
import useStore from '../../store/store';
import { Outlet } from 'react-router-dom';
import { MainNavigation } from '@buerokratt-ria/menu';
import { Header, useMenuCountConf } from '@buerokratt-ria/header'
import useToastStore from 'store/toasts.store';
import './Layout.scss';

type LayoutProps = {
  disableMenu?: boolean;
  customHeader?: ReactNode;
};

const Layout: FC<PropsWithChildren<LayoutProps>> = ({
    disableMenu,
    customHeader,
    children,
  }) => {
  const menuCountConf = useMenuCountConf();

  return (
    <div className="layout">
      {!disableMenu && <MainNavigation countConf={menuCountConf} />}
      <div className="layout__wrapper">
        {
          customHeader ?? <Header
                toastContext={{ open: useToastStore.getState().open }}
                user={useStore.getState().userInfo}
            />
        }
        <main className="layout__main">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
