package com.sdl.dxa.modules.ish.services;

import com.sdl.dxa.modules.ish.model.Publication;
import com.sdl.webapp.common.api.localization.Localization;
import com.sdl.webapp.common.controller.exception.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URLEncoder;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public interface PublicationService {
    static final Logger LOG = LoggerFactory.getLogger(PublicationService.class);
    static final Pattern PRODUCT_FAMILY_PATTERN = Pattern.compile("(.*)\\s(\\(.+\\))");

    List<Publication> getPublicationList(Localization localization);

    void checkPublicationOnline(int publicationId, Localization localization) throws NotFoundException;

    default String getEncodedProductFamily(String valueArg) {
        if (valueArg == null) return null;
        String value = valueArg;
        try {
            Matcher matcher = PRODUCT_FAMILY_PATTERN.matcher(valueArg);
            if (matcher.find()) {
                value = URLEncoder.encode(matcher.group(1).trim(), "UTF-8") + " " + matcher.group(2);
            } else {
                value = URLEncoder.encode(value.trim(), "UTF-8");
            }
        } catch (Exception ex) {
            LOG.error("Could not encode [" + valueArg + "] to UTF-8. Not a standard JVM?", ex);
        }
        LOG.debug("{} -> {}", valueArg, value);
        return value;
    }
}
