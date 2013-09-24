<?php

class UsersController extends Zend_Controller_Action
{

    public function init()
    {
        /* Initialize action controller here */
    }

    public function indexAction()
    {

    }
    
    public function analyseAction()
    {
        $this->getHelper('layout')->disableLayout();
        $this->getHelper('ViewRenderer')->setNoRender();
        
        $request = $this->getRequest();
        if ($request->isPost()) {
            $userData = $request->getParam('user');
            $usersData = $request->getParam('users');
            $viewerFriendsIds = $request->getParam('viewerFriendsIds');
            $users = new Application_Model_Users();
            try {
                $users->setViewerFriendsIds($viewerFriendsIds);
                $data = array('response' => $users->analyseFields($userData, $usersData) );
            } catch (Exception $e) {
                $data = array('error' => $e->getMessage());
            }

            $this->getResponse()->setBody(Zend_Json::encode($data));
        }
        
    }


}

