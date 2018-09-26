﻿using DD4T.Serialization;
using Newtonsoft.Json.Linq;
using Sdl.Web.Common.Models;
using Sdl.Web.Tridion.PCAClient;
using Sdl.Web.Mvc.Configuration;
using Sdl.Web.PublicContentApi;
using Sdl.Web.PublicContentApi.ContentModel;
using System.Collections.Generic;
using System.Linq;
using Sdl.Web.Modules.TridionDocsMashup.Models.Widgets;
using System;

namespace Sdl.Web.Modules.TridionDocsMashup.Client
{
    /// <summary>
    /// This class is a wrapper around the actual PublicContentApi client 
    /// and tries to isolate the related logic and codes for creating the filters and performing the query 
    /// and processing the results
    /// </summary>
    public class PublicContentApiClient
    {
        private IPublicContentApi _publicContentApi;
        private JSONSerializerService _dd4tSerializer = new JSONSerializerService();

        public PublicContentApiClient()
        {
            _publicContentApi = PCAClientFactory.Instance.CreateClient();
        }

        /// <summary>
        /// Returns a collection of Tridion docs topics based on the provided keywords 
        /// </summary>
        public List<Topic> GetTridionDocsTopicsByKeywords(Dictionary<string, KeywordModel> keywords, int maxItems)
        {
            List<ItemEdge> results = ExecuteQuery(keywords, maxItems);
            List<Topic> topics = GetDocsTopics(results);
            return topics;
        }

        /// <summary>
        /// Creates the required filters and peforms the query to fetch and return the results  
        /// </summary>
        private List<ItemEdge> ExecuteQuery(Dictionary<string, KeywordModel> keywords, int maxItems)
        {
            if (maxItems < 1)
            {
                return null;
            }

            List<InputItemFilter> keywordFilters = GetKeyWordFilters(keywords);

            // First , we filter the query based on the specified language in the current culture.
            InputItemFilter languageFilter = GetLanguageFilter(WebRequestContext.Localization.CultureInfo.Name);

            ItemConnection results = ExecuteItemQuery(keywordFilters, languageFilter, maxItems);

            // If no result, then we do another query based on the parent language (if exists).
            if (results?.Edges == null || !results.Edges.Any())
            {
                var parentLanguage = WebRequestContext.Localization.CultureInfo.Parent?.Name;

                if (!string.IsNullOrEmpty(parentLanguage))
                {
                    languageFilter = GetLanguageFilter(parentLanguage);

                    results = ExecuteItemQuery(keywordFilters, languageFilter, maxItems);
                }
            }

            return results?.Edges;
        }

        /// <summary>
        /// Performs the query by PublicContentApi client based on the given filters 
        /// </summary>
        private ItemConnection ExecuteItemQuery(IEnumerable<InputItemFilter> keywordfilters, InputItemFilter languageFilter, int maxItems)
        {
            var customMetaFilters = keywordfilters.ToList();

            customMetaFilters.Add(languageFilter);

            InputItemFilter filter = new InputItemFilter
            {
                NamespaceIds = new List<ContentNamespace> { ContentNamespace.Docs },
                ItemTypes = new List<PublicContentApi.ContentModel.FilterItemType> { PublicContentApi.ContentModel.FilterItemType.PAGE },
                And = customMetaFilters
            };

            var contextData = new ContextData()
            {
                ClaimValues = new List<ClaimValue> {
                new ClaimValue(){ Uri="dxa:modelservice:model:entity:relativelinks",Value="false",Type = ClaimValueType.BOOLEAN},
                new ClaimValue(){ Uri="taf:tcdl:render:link:relative",Value="false",Type = ClaimValueType.BOOLEAN}
                }
            };

            var prefixForTopicsUrl = WebRequestContext.Localization?.GetConfigValue("tridiondocsmashup.PrefixForTopicsUrl");
            if (!string.IsNullOrWhiteSpace(prefixForTopicsUrl))
            {
                contextData.ClaimValues.Add(new ClaimValue() { Uri = "taf:tcdl:render:link:urlprefix", Value = prefixForTopicsUrl, Type = ClaimValueType.STRING });
            }

            var prefixForBinariesUrl = WebRequestContext.Localization?.GetConfigValue("tridiondocsmashup.PrefixForBinariesUrl");
            if (!string.IsNullOrWhiteSpace(prefixForBinariesUrl))
            {
                contextData.ClaimValues.Add(new ClaimValue() { Uri = "taf:tcdl:render:link:binaryUrlPrefix", Value = prefixForBinariesUrl, Type = ClaimValueType.STRING });
            }

            var results = _publicContentApi.ExecuteItemQuery(
                filter,
                new InputSortParam { Order = SortOrderType.Descending, SortBy = SortFieldType.LAST_PUBLISH_DATE },
                new Pagination { First = maxItems },
                null,
                renderContent: true,
                includeContainerItems: true,
                contextData: contextData
                );

            return results;
        }

        /// <summary>
        /// Extracts and returns a collection of topics from the query's results 
        /// </summary>
        private List<Topic> GetDocsTopics(List<ItemEdge> results)
        {
            var topics = new List<Topic>();

            if (results != null)
            {
                foreach (var edge in results)
                {
                    Page page = edge.Node as Page;

                    // Based on the GraphQl's results , we need to look into the below path to get the topic's title and body . 
                    // page >  containerItems > componentPresentation > component > fields >  topicTitle and topicBody

                    if (page != null)
                    {
                        var topic = new Topic
                        {
                            Link = GetFullyQualifiedUrlForTopic(page.Url)
                        };

                        if (page.ContainerItems != null)
                        {
                            foreach (ComponentPresentation componentPresentation in page.ContainerItems)
                            {
                                string componentDD4TJson = (componentPresentation?.RawContent?.Data["Component"] as JObject)?.ToString();

                                if (!string.IsNullOrEmpty(componentDD4TJson))
                                {
                                    DD4T.ContentModel.Component component = _dd4tSerializer.Deserialize<DD4T.ContentModel.Component>(componentDD4TJson);

                                    if (component != null)
                                    {
                                        topic.Id = component.Id;
                                        topic.Title = component.Fields["topicTitle"]?.Value;
                                        topic.Body = component.Fields["topicBody"]?.Value;
                                    }
                                }
                            }
                        }

                        topics.Add(topic);
                    }
                }
            }

            return topics;
        }

        /// <summary>
        /// Creates and returns a collection of <see cref="InputItemFilter"/> based on the given keyword models
        /// </summary>
        private static List<InputItemFilter> GetKeyWordFilters(Dictionary<string, KeywordModel> keywords)
        {
            var keyWordFilters = new List<InputItemFilter>();

            foreach (var keyword in keywords)
            {
                var keywordFilter = new InputItemFilter
                {
                    CustomMeta = new InputCustomMetaCriteria
                    {
                        Key = GetKeywordKey(keyword.Key),
                        Value = keyword.Value.Id,
                        Scope = GetKeywordScope(keyword.Key)
                    }
                };

                keyWordFilters.Add(keywordFilter);
            }

            return keyWordFilters;
        }

        /// <summary>
        /// Creates and returns an <see cref="InputItemFilter"/> based on the given language
        /// </summary>
        private static InputItemFilter GetLanguageFilter(string language)
        {
            var languageFilter = new InputItemFilter
            {
                CustomMeta = new InputCustomMetaCriteria
                {
                    Key = "DOC-LANGUAGE.lng.value",
                    Value = language,
                    Scope = CriteriaScope.Publication
                }
            };

            return languageFilter;
        }

        /// <summary>
        /// Extracts and returns the actual keyword's key from the provided field's XML Name 
        /// </summary>
        private static string GetKeywordKey(string keywordFiledXmlName)
        {
            // In schema , a category field is named as this format : SCOPE.KEYWORDNAME.FIELDTYPE 
            // Example : Publication.FMBPRODUCTRELEASENAME.Version  or Item.FMBCONTENTREFTYPE.Logical
            // We need to remove the scope and append ".element" to it (e.g. FMBPRODUCTRELEASENAME.Version.element).

            string scop = keywordFiledXmlName.Split('.')?[0];
            string key = keywordFiledXmlName.Replace(scop + ".", string.Empty);
            return key + ".element";
        }

        /// <summary>
        /// Extracts and returns the keyword filter's scope from the provided field's XML Name 
        /// </summary>
        private static CriteriaScope GetKeywordScope(string keywordFiledXmlName)
        {
            // In schema , a category field is named as this format : SCOPE.KEYWORDNAME.FIELDTYPE  
            // Example : Publication.FMBPRODUCTRELEASENAME.Version  or Item.FMBCONTENTREFTYPE.Logical
            // We need to get the first part (e.g. Item) and returns associated enum value.

            string scope = keywordFiledXmlName.Split('.')?[0];

            switch (scope?.ToLower())
            {
                case "item":
                    return CriteriaScope.Item;
                case "iteminpublication":
                    return CriteriaScope.ItemInPublication;
            }

            return CriteriaScope.Publication;
        }

        /// <summary>
        /// Create and return the topic's url having fully quialified doman name
        /// </summary>
        private static string GetFullyQualifiedUrlForTopic(string url)
        {
            if (!string.IsNullOrEmpty(url))
            {
                Uri uri;

                if (Uri.TryCreate(url, UriKind.Absolute, out uri))
                {
                    url = uri.ToString();
                }
                else
                {
                    if (!url.StartsWith("/"))
                    {
                        url = "/" + url;
                    }

                    var prefixForTopicsUrl = WebRequestContext.Localization.GetConfigValue("tridiondocsmashup.PrefixForTopicsUrl");

                    Uri baseUri;

                    if (Uri.TryCreate(prefixForTopicsUrl, UriKind.Absolute, out baseUri))
                    {
                        if (Uri.TryCreate(baseUri, url, out uri))
                        {
                            url = uri.ToString();
                        }
                    }
                }
            }

            return url;
        }

    }
}
