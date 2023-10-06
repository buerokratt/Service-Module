import { FC, useState, ReactNode, PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';
import useUserInfoStore from '../../store/store';
import {
  Header,
  MainNavigation
} from '@exirain/header/src';
import './Layout.scss';
import {useQuery} from "@tanstack/react-query";

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
                baseUrlV2={import.meta.env.REACT_APP_RUUTER_V2_PRIVATE_API_URL}
                baseUrl={import.meta.env.REACT_APP_RUUTER_V1_PRIVATE_API_URL}
                analticsUrl={import.meta.env.REACT_APP_RUUTER_V2_ANALYTICS_API_URL}
                user={useUserInfoStore.getState()}
            />}
            <main className="layout__main">
              {children ?? <Outlet/>}
            </main>
          </div>
        </div>
    )
  };

export default Layout;
