<?php

class Bootstrap extends Zend_Application_Bootstrap_Bootstrap
{  
    protected function _initSession()
    {
        Zend_Session::setOptions(array('cookie_httponly' => true));
        Zend_Session::start();
        Zend_Session::rememberMe(60*60*24*7*30*12*10);
    }
    
    protected function _initConfig()
    {
        $config = new Zend_Config($this->getOptions(), true);
        Zend_Registry::set('config', $config);
        return $config;
    }
    
    protected function _initVKData()
    {
        $this->bootstrap('view');
        $view = $this->getResource('view');
        $registry = Zend_Registry::get('config');
        $view->vkData = $registry->vk->app;
        return $view;
    }
    
    protected function _initDoctype()
    {
        $this->bootstrap('view');
        $view = $this->getResource('view');
        $view->doctype('XHTML1_STRICT');
        return $view;
    }
    
    protected function _initJavascript()
    {
    	$this->bootstrap('view');
        $view = $this->getResource('view');
        $view->headScript()->appendFile('http://vk.com/js/api/xd_connection.js?2','text/javascript')
            ->appendFile($view->baseUrl('js/fb.js'),'text/javascript')
            ->appendFile($view->baseUrl('js/view.js'),'text/javascript')
            ->appendFile($view->baseUrl('js/users.js'),'text/javascript')
            ->appendFile($view->baseUrl('js/functions.js'),'text/javascript')
            ->appendFile($view->baseUrl('js/helper.js'),'text/javascript')
            ->appendFile($view->baseUrl('js/run.js'),'text/javascript')
            //->appendFile($view->baseUrl('js/library/cloud-carousel.1.0.5.js'),'text/javascript')
            ->appendFile($view->baseUrl('js/library/jquery-ui-1.8.23.custom.min.js'),'text/javascript')
            ->appendFile($view->baseUrl('js/library/jquery.nivo.slider.js'),'text/javascript')
            ->prependFile($view->baseUrl('js/library/jquery-1.8.0.min.js'),'text/javascript');

        return $view;
    }

    protected function _initStyleSheets()
    {
    	$this->bootstrap('view');
        $view = $this->getResource('view');
    	$view->headLink()->appendStylesheet($view->baseUrl('css/common.css'));
        $view->headLink()->appendStylesheet($view->baseUrl('css/slider.css'));
        $view->headLink()->appendStylesheet($view->baseUrl('css/jquery-ui-1.8.23.custom.css'));
        return $view;
    }
}

