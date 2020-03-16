export interface ConfigModel {
    id: number;
    name: string;
    username: string;
    email: string;
    sutAppZipFileName : string;
    sutAppPort : number;
    loadGenerationThreads : number;
    loadGenerationRampupTimeInSeconds : number;
    loadGenerationDurationInSeconds : number;
    sutAppHostname : string;
    mavenExePath : string;
    mavenOnline : boolean;
    snail4jMavenRepo : boolean;
    wiremockHostname : string;
    wiremockPort : number;
    h2Hostname : string;
    h2Port : number;
    wiremockStopCmd : string;
    javaHome : string;
    mavenHome : string;
    userHomeDir : string;
    maxExceptionCountPerEvent : number;
    mavenZipFileNameWithoutExtension : string;
    mavenRepositoryHome : string;
    processManagerZipFileName : string;
    systemUnderTestStdoutLogFileName : string;
    loadGeneratorStdoutLogFileName : string;
    h2DataFileName : string;
    h2DataFileHome : string;
    jmeterFilesZipFileName : string;
    loadGeneratorLaunchCmd : string;
    processManagerLaunchCmd : string;
    processManagerHome : string;
    logDir : string;
    sutKillFile : string;
    jmeterNonGuiPort : number;
    glowrootZipFileName : string;
    wiremockStopStdoutLogFileName : string;
    windowsKillerProcess : string;
    wiremockFilesZipFileName : string;
    wiremockFilesHome : string;
    sutAppHome : string;
    glowrootHome : string;
    jmeterFilesHome : string;
    snail4jHome : string;    
  }