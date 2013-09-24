<?php

class Application_Model_Users
{
    protected $_suggestionData;
    protected $_userData;
    protected $_usersData;
    protected $_viewerFriendsIds;
    
    public function __construct()
    {
        //Application_Model_DbTable_Userdata
    }
    
    public function getViewerId()
    {
        $session = new Zend_Session_Namespace('VK');
        if (isset($session->client_params) && isset($session->client_params['viewer_id']))
            return (int)$session->client_params['viewer_id'];
        
        throw new Exception("Viewer Id is not defined");
    }
    
    public function setViewerFriendsIds($ids)
    {
        if (!is_array($ids))
            throw new Exception("Invalid argument passed. Array expected");
        $this->_viewerFriendsIds = $ids;
    }
    
    public function analyseFields($userData, $usersData)
    {
        if (empty($userData) || !is_array($usersData))
            throw new Exception ("Data is not valid");
        
        $this->_userData = $userData;
        $this->_usersData = $usersData;
        $this->_filterUsersData();
        $this->_generateSuggestionsData();
        
        return $this->_suggestionData;
    }
    
    
    protected function _generateSuggestionsData()
    {   
        $analysed = array(
            'users' => '',
            'found' => 0
        );
        
        // Need to solve the problem with different sessions when opened in multiple tabs
        $viewerId = $this->getViewerId();
        
        $normalizer = function($value) {
            return trim(strtolower($value));
        };
        
        foreach ($this->_usersData as $user) {
            
            if ($user['uid'] == $viewerId) continue;
            
            if (!isset($user['uid'])) continue;
            
            // Initialise user fields
            $analysed['users'][$user['uid']] = array(
                'uid'       => $user['uid'],
                'sex'       => (isset($user['sex'])) ? $user['sex'] : 0,
                'matches'   => 0,
                'interests' => array(),
                'movies'    => array(),
                'tv'        => array(),
                'books'     => array(),
                'games'     => array(),
                'mutual'    => (isset($user['mutual'])) ? $user['mutual'] : array()
            );
            
            $iteratedUserInterests = array(
                'interests' => (isset($user['interests']) && $user['interests'] != "") ? array_map($normalizer, array_unique(explode(',', $user['interests']))) : array(),
                'movies'    => (isset($user['movies']) && $user['movies'] != "") ? array_map($normalizer, array_unique(explode(',', $user['movies']))) : array(),
                'tv'        => (isset($user['tv']) && $user['tv'] != "") ? array_map($normalizer, array_unique(explode(',', $user['tv']))) : array(),
                'books'     => (isset($user['books']) && $user['books'] != "") ? array_map($normalizer, array_unique(explode(',', $user['books']))) : array(),
                'games'     => (isset($user['games']) && $user['games'] != "") ? array_map($normalizer, array_unique(explode(',', $user['games']))) : array(),
                
            );
            
            foreach ($iteratedUserInterests as $interestsKey => $interests) {
                if (!empty($interests) && $this->_userData[$interestsKey] != "") {
                    $userInterests = array_unique(explode(',', $this->_userData[$interestsKey]));
                    $userInterests = array_map($normalizer, $userInterests);   
                    foreach ($userInterests as $i) {
                        if (in_array($i, $interests)) {
                            $analysed['users'][$user['uid']]['matches']++;
                            $analysed['users'][$user['uid']][$interestsKey][] = $i;
                        }
                    }  
                }  
            }
            
            if ($analysed['users'][$user['uid']]['matches'] > 0) $analysed['found']++;
            
        }
        
        $sorter = function($a, $b){
            if ($a['matches'] == $b['matches']) return 0;
            return ($a['matches'] > $b['matches']) ? -1 : 1;
        };
        uasort($analysed['users'], $sorter);
        
        $analysed['users'] = array_slice($analysed['users'], 0, $analysed['found']);      
        
        $this->_suggestionData = $analysed;
    }
    
    protected function _filterUsersData()
    {
        $filtered = array();
        foreach ($this->_usersData as $user) {
            if (in_array($user['uid'], $this->_viewerFriendsIds)) continue;
            $filtered[$user['uid']] = $user;
        }
        
        // And filter by opposite sex
        
        
        $this->_usersData = $filtered;
    }
    
    public function saveData()
    {
        $viewerId = $this->getViewerId();
        $data = serialize($this->_suggestionData);
        
        //
        $viewerId = 11728334;
        $this->_suggestionData = array('found' => 5, 'users' => array(1,5,4,8,9,65,2,1));
        $data = serialize($this->_suggestionData);
        
        $userdata = new Application_Model_DbTable_Userdata();
        $row = $userdata->fetchRow($userdata->select()->where('user_id = ?', $viewerId));
        var_dump($row);
        
        /*
        $bugs = new Bugs();
        $row = $bugs->fetchRow($bugs->select()->where('bug_id = ?', 1));

        // Change the value of one or more columns
        $row->bug_status = 'FIXED';

        // UPDATE the row in the database with new values
        $row->save();
         * 
         */
        
    }
    
    
}