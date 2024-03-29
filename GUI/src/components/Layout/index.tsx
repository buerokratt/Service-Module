import { FC, useState, ReactNode, PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';
import { MainNavigation } from '@buerokratt-ria/menu';
import { Header } from '@buerokratt-ria/header'
import {useQuery} from "@tanstack/react-query";
import useStore from '../../store/store';
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

    const CACHE_NAME = 'mainmenu-cache';

    const [MainMenuItems, setMainMenuItems] = useState([])

    const {data, isLoading, status} = useQuery({
      queryKey: [import.meta.env.REACT_APP_MENU_URL + import.meta.env.REACT_APP_MENU_PATH],
      onSuccess: (res: any) => {
        try {
          setMainMenuItems(res);
          localStorage.setItem(CACHE_NAME, JSON.stringify(res));
        } catch (e) {
          console.log(e);
        }
      },
      onError: (error: any) => {
        setMainMenuItems(getCache());
      }

    });

    function getCache(): any {
      const cache = localStorage.getItem(CACHE_NAME) || '{}';
      return JSON.parse(cache);
    }

    return (
        <div className="layout">
          {!disableMenu &&
              <MainNavigation serviceId={import.meta.env.REACT_APP_SERVICE_ID.split(',')} items={MainMenuItems}/>}
          <div className="layout__wrapper">
            {customHeader ?? <Header
                toastContext={{ open: useToastStore.getState().open }}
                user={useStore.getState().userInfo}
            />}
            <main className="layout__main">
              {children ?? <Outlet/>}
            </main>
          </div>
        </div>
    )
  };

export default Layout;
