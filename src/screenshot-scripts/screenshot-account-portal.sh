#!/bin/sh

# assume we are running from directory we live in
PATH_TO_FA_SCREENSHOT=../../src
PATH_TO_SITE_TOP_DIR=../..
SLEEP_AMT=1

#$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/ -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f login-screen 
#sleep $SLEEP_AMT
#
#read -p "click the 'create account' link and press any key to continue" -n1 -s
#
#$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f registration-first-screen
#
#read -p "add a user info and password and press any key to continue" -n1 -s
#
#$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f registration-second-screen
#
#read -p "Log into the pied piper account and press any key to continue... " -n1 -s
#

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/ -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f home-tab
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/purchase/shopping-cart -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f shopping-card-tab
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/plan/ -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f plan-tab
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/deployment -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f deployment-tab
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/user -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f users-list
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/user -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f users-list-add
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/user/edit/76f39572-2a4c-4372-b784-ec6773bfa77d -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f users-edit
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/billing/ -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f billing-overview
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/billing/ -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f billing-overview
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/billing/edit-billing-info -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f billing-update-detail
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/billing/edit-credit-card -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f billing-update-card
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/billing/list-invoices -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f billing-view-invoices
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/company/edit -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f company-edit
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/company/delete -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f company-danger-zone
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/early-access/ -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f early-access
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/support/ -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f support-tab
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u 'https://login.fusionauth.io/account/?client_id=c50329fa-93e5-4618-8d9f-73d0ab069a54&company=Pied%20Piper' -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f account-profile
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u 'https://login.fusionauth.io/account/edit?client_id=c50329fa-93e5-4618-8d9f-73d0ab069a54&company=Pied%20Piper' -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f account-edit-user
sleep $SLEEP_AMT

$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u 'https://login.fusionauth.io/account/two-factor/?client_id=c50329fa-93e5-4618-8d9f-73d0ab069a54&company=Pied%20Piper' -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/admin-guide/account-portal -f account-two-factor
sleep $SLEEP_AMT


exit

TODO
need to add an account that has billing issues
crop bottom
$PATH_TO_FA_SCREENSHOT/fa-screenshot.sh -u https://account.fusionauth.io/account/purchase/add-deployment -s 300 -d $PATH_TO_SITE_TOP_DIR/site/assets/img/docs/installation-guides/cloud -f provisioning-select-type

todo support

deployments 
plans
billing change card (blur?)
brian's card?

with and without early access

need to have way to add highlight

# to black it out
magick test.png -fill black -draw "rectangle 540,550 800,600" result.png

# to highligth
magick test.png -fill none  -stroke black -strokewidth 3  -draw "rectangle 540,550 800,600" result.png

# crop

magick test.png -gravity South -chop 0x400 result.png
