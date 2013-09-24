<?php

class IndexController extends Zend_Controller_Action
{

    public function init()
    {
        /* Initialize action controller here */
    }

    public function indexAction()
    {
        $request = $this->getRequest();
        
        $session = new Zend_Session_Namespace('VK');
        
        $session->client_params = array(
            'api_url'           => $request->getParam('api_url'),
            'api_id'            => $request->getParam('api_id'),
            'api_settings'      => $request->getParam('api_settings'),
            'viewer_id'         => $request->getParam('viewer_id'),
            'viewer_type'       => $request->getParam('viewer_type'),
            'sid'               => $request->getParam('sid'),
            'secret'            => $request->getParam('secret'),
            'access_token'      => $request->getParam('access_token'),
            'user_id'           => $request->getParam('user_id'),
            'group_id'          => $request->getParam('group_id'),
            'is_app_user'       => $request->getParam('is_app_user'),
            'auth_key'          => $request->getParam('auth_key'),
            'language'          => $request->getParam('language'),
            'parent_language'   => $request->getParam('parent_language'),
            'ad_info'           => $request->getParam('ad_info'),
            'referrer'          => $request->getParam('referrer'),
            'lc_name'           => $request->getParam('lc_name'),
            'hash'              => $request->getParam('hash')
        );
        
        $this->view->data = $session->client_params;
    }


}

