log() {
    TIMEZONE=Central
    MAXLEN=35
    MSG=$1
    for i in $(seq ${#MSG} $MAXLEN)
    do
        MSG=$MSG.
    done
    MSG=$MSG$(TZ=":US/$TIMEZONE" date +%T)
    echo $MSG
}
PASS() {
    BUILD_ID=$1
    echo "✔ SUCCESS ${BUILD_ID}" >> $TEST_DIRECTORY/results.txt
}
FAIL() {
    BUILD_ID=$1
    if type toilet >/dev/null 2>&1; then
        toilet -f pagga FAILURE
    else
        log "${BUILD_ID}: FAILURE"
    fi
    echo "✗ FAILURE ${BUILD_ID}" >> $TEST_DIRECTORY/results.txt
}
init_test_directory() {
    TEST_DIRECTORY=$1
    if [ -d "$TEST_DIRECTORY" ]; then
        rm -frd $TEST_DIRECTORY/*
    else
        mkdir -p $TEST_DIRECTORY
    fi
}
prepare() {
    export CHROME_BIN=$(which chromium-browser)
    BUILD_ID=$1
    SILENT=" > ${TEST_DIRECTORY}/${BUILD_ID}/log-setup.txt 2>&1"
    mkdir $TEST_DIRECTORY/$BUILD_ID
    cd $TEST_DIRECTORY/$BUILD_ID
    log $BUILD_ID
    eval "COMMAND=\${"$BUILD_ID"}"
    eval ${COMMAND}${SILENT}
}
build() {
    BUILD_ID=$1
    cd $TEST_DIRECTORY/$BUILD_ID
    NODE_OPTIONS=--no-warnings npm run build > $TEST_DIRECTORY/$BUILD_ID/log-build.txt
    NODE_OPTIONS=--no-warnings npm test -- --silent > $TEST_DIRECTORY/$BUILD_ID/log-test.txt 2>&1
}
check_build() {
    BUILD_ID=$1
    if cat $TEST_DIRECTORY/$BUILD_ID/log-build.txt | grep -q "Aborted due to warnings." ;then
        FAIL $BUILD_ID
    else
        if cat $TEST_DIRECTORY/$BUILD_ID/log-test.txt | grep -q "Done." ;then
            PASS $BUILD_ID
        else
            FAIL $BUILD_ID
        fi
    fi
}
run() {
    BUILD_ID=$1
    prepare ${BUILD_ID}
    build ${BUILD_ID}
    check_build ${BUILD_ID}
}
