package com.github.eostermueller.snail4j;

import java.io.File;
import java.net.MalformedURLException;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.github.eostermueller.snail4j.launcher.CannotFindSnail4jFactoryClass;
import com.github.eostermueller.snail4j.launcher.Messages;

public class InstallAdvice {
	private final Logger LOGGER = LoggerFactory.getLogger(this.getClass());

	/**
	 * 
	 * @return
	 * @throws CannotFindSnail4jFactoryClass 
	 * @throws MalformedURLException 
	 */
	public boolean isJavaHomeEnvVarOk() throws CannotFindSnail4jFactoryClass, MalformedURLException {
		boolean rc = false;
		
		Messages m = DefaultFactory.getFactory().getMessages();
		
		String javaHome = System.getenv("JAVA_HOME");
		if (javaHome == null) {
			LOGGER.error( m.javaHomeEnvVarNotSet() );
		} else {
			File javaHomeFolder = Paths.get(javaHome).toFile();
			if (!javaHomeFolder.exists() || !javaHomeFolder.isDirectory()) {
				LOGGER.error( m.javaHomeFolderDoesNotExistOrLackingPermissions(javaHomeFolder) );
			} else {
				rc = true;
			}
		}

		if (!rc) {
			LOGGER.error( new DocumentationLinks().getJdkInstallAdvice().toString() );
		}
		
		return rc;
	}

}
