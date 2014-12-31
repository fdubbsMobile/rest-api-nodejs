<xsl:template match="po">
	<xsl:if test="owner">
		<div class="post_h">
			<p>
				发信人:
				<a class="powner" href="qry?u={owner}">
					<xsl:value-of select="owner"/>
				</a>
				(
				<xsl:value-of select="nick"/>
				), 信区:
				<a href="doc?board={board}">
					<xsl:value-of select="board"/>
				</a>
			</p>
			<p>
				标  题:
				<span class="ptitle">
					<xsl:value-of select="title"/>
				</span>
			</p>
			<p>
				发信站:
				<xsl:value-of select="$bbsname"/>
				(
				<xsl:value-of select="date"/>
				), 站内信件
			</p>
		</div>
	</xsl:if>
	<xsl:for-each select="pa">
		<div class="post_{@m}">
			<xsl:for-each select="p">
				<p>
					<xsl:apply-templates select="."/>
				</p>
			</xsl:for-each>
		</div>
	</xsl:for-each>
</xsl:template>
<xsl:template match="br">
	<br/>
</xsl:template>
<xsl:template match="c">
	<span class="a{@h}{@f} a{@b}">
		<xsl:value-of select="."/>
	</span>
</xsl:template>
<xsl:template match="a">
	<a href="{@href}">
		<xsl:choose>
			<xsl:when test="@i">
				<img src="{@href}"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="@href"/>
			</xsl:otherwise>
		</xsl:choose>
	</a>
</xsl:template>